import uuid
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Literal
import random
from .models import GameState, Player, JoinGamePayload, GameCreationResponse, AddBotPayload
from .connection_manager import manager
from .game_logic import process_round_end
from .bot_logic import make_bot_choices

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

games: Dict[str, GameState] = {}
game_timers: Dict[str, asyncio.Task] = {}

ROUND_DURATION = 20
RESULTS_DURATION = 10

async def game_loop(game_id: str):
    """O coração do jogo, controla o fluxo de rodadas e timers."""

    await asyncio.sleep(0.5)
    
    game = games.get(game_id)
    if not game or game.is_finished:
        return

    game.is_started = True
    make_bot_choices(game)

    if game.current_round in game.mission_rounds:
        player_ids = list(game.players.keys())
        traitor_id = random.choice(player_ids) 
        for pid, player in game.players.items():
            if pid == traitor_id:
                player.secret_mission = "TRAITOR"
            else:
                player.secret_mission = "DEFAULT"

    await manager.broadcast({"type": "ROUND_START", "payload": game.dict()}, game_id)

    timer_task = asyncio.create_task(asyncio.sleep(ROUND_DURATION))
    game_timers[game_id] = timer_task
    
    try:
        await timer_task
    except asyncio.CancelledError:
        pass

    process_round_end(game)
    await manager.broadcast({"type": "ROUND_END", "payload": game.dict()}, game_id)

    await asyncio.sleep(RESULTS_DURATION)

    if game.is_finished:
        await manager.broadcast({"type": "GAME_OVER", "payload": game.dict()}, game_id)
        await asyncio.sleep(60)
        games.pop(game_id, None)
        game_timers.pop(game_id, None)
    else:
        asyncio.create_task(game_loop(game_id))

@app.post("/game/{game_id}/add_bot")
async def add_bot(game_id: str, payload: AddBotPayload):
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Jogo não encontrado")
    
    game = games[game_id]
    if game.is_started:
        raise HTTPException(status_code=403, detail="Não é possível adicionar bots após o início do jogo.")

    bot_id = f"bot_{uuid.uuid4()}"
    strategy_names = {
        "ALWAYS_COOPERATE": "Bot Anjo 😇",
        "ALWAYS_BETRAY": "Bot Demônio 😈",
        "RANDOM": "Bot Caótico 🤪",
        "TIT_FOR_TAT": "Bot Rancoroso 🧐"
    }
    bot_name = strategy_names.get(payload.strategy, "Bot")

    bot = Player(id=bot_id, name=bot_name, is_bot=True, strategy=payload.strategy)
    game.players[bot_id] = bot

    await manager.broadcast({"type": "PLAYER_JOINED", "payload": game.dict()}, game_id)
    return {"message": f"{bot_name} adicionado."}


@app.post("/game", response_model=GameCreationResponse)
async def create_game():
    """Cria uma nova sala de jogo."""
    game_id = str(uuid.uuid4())[:6]
    host_id = str(uuid.uuid4())
    
    game = GameState(game_id=game_id, host_id=host_id)
    games[game_id] = game
    
    return GameCreationResponse(game_id=game_id, host_id=host_id)

@app.post("/game/{game_id}/join")
async def join_game(game_id: str, payload: JoinGamePayload):
    """Permite que um jogador entre em uma sala existente."""
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Jogo não encontrado")
    
    game = games[game_id]
    if game.is_started:
        raise HTTPException(status_code=403, detail="O jogo já começou")

    player_id = str(uuid.uuid4())
    player = Player(id=player_id, name=payload.player_name)
    game.players[player_id] = player
    await manager.broadcast({"type": "PLAYER_JOINED", "payload": game.dict()}, game_id)
    
    return {"player_id": player_id, "game_state": game.dict()}

@app.post("/game/{game_id}/start")
async def start_game(game_id: str, host_id: str):
    """Inicia o jogo (apenas o host pode fazer isso)."""
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Jogo não encontrado")
    
    game = games[game_id]
    if game.host_id != host_id:
        raise HTTPException(status_code=403, detail="Apenas o host pode iniciar o jogo")
        
    if game.is_started:
        return {"message": "O jogo já foi iniciado."}
        
    asyncio.create_task(game_loop(game_id))
    
    return {"message": "Jogo iniciado!"}

@app.websocket("/ws/{game_id}/{player_id}")
async def websocket_endpoint(websocket: WebSocket, game_id: str, player_id: str):
    if game_id not in games or player_id not in games[game_id].players:
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, game_id)
    await websocket.send_json({"type": "WELCOME", "payload": games[game_id].dict()})

    try:
        while True:
            data = await websocket.receive_json()
            game = games.get(game_id)
            if not game: break

            if data.get("action") == "CHOOSE" and game.is_started and not game.is_finished:
                player = game.players.get(player_id)
                if player and player.current_choice is None:
                    player.current_choice = data.get("choice")
                    
                    await manager.broadcast({"type": "PLAYER_VOTED", "payload": {"player_id": player_id}}, game_id)

                    all_voted = all(p.current_choice is not None for p in game.players.values())
                    if all_voted and game_id in game_timers:
                        game_timers[game_id].cancel()

            human_players = [p for p in game.players.values() if not p.is_bot]
            all_humans_voted = all(p.current_choice is not None for p in human_players)
            
            if all_humans_voted and game_id in game_timers:
                game_timers[game_id].cancel()

    except WebSocketDisconnect:
        manager.disconnect(websocket, game_id)
        if game_id in games:
            await manager.broadcast({"type": "PLAYER_DISCONNECTED", "payload": {"player_id": player_id}}, game_id)