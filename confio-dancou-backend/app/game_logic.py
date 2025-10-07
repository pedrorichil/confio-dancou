from .models import GameState
import random

def process_round_end(game: GameState):
    """Calcula os resultados da rodada e atualiza o estado do jogo."""
    if not all(p.current_choice for p in game.players.values()):
        # Força uma escolha para jogadores que não votaram (ex: considerá-los como traidores ou cooperadores)
        # Vamos assumir que quem não vota, coopera (para não punir tanto a rede)
        for player in game.players.values():
            if not player.current_choice:
                player.current_choice = "COOPERAR"
    noise_event_triggered = False
    choices = [p.current_choice for p in game.players.values()]
    num_cooperate = choices.count("COOPERAR")
    num_betray = choices.count("TRAIR")
    
    majority_is_cooperate = num_cooperate >= num_betray


    if random.random() < 0.15: 
        noise_event_triggered = True
        
        player_ids = list(game.players.keys())
        if player_ids: 
            affected_player_id = random.choice(player_ids)
            affected_player = game.players[affected_player_id]
            
            if affected_player.current_choice == "COOPERAR":
                affected_player.current_choice = "TRAIR"
            else:
                affected_player.current_choice = "COOPERAR"


    for player in game.players.values():
        if player.current_choice:
            player.action_history.append(player.current_choice)

    for player in game.players.values():
        if player.current_choice == "COOPERAR":
            player.score += 3 if majority_is_cooperate else 0
        elif player.current_choice == "TRAIR":
            player.score += 5 if majority_is_cooperate else 1

    mission_success = None 
    if game.current_round in game.mission_rounds:
        traitor_succeeded = not majority_is_cooperate
        mission_success = traitor_succeeded 
        if traitor_succeeded:
            for player in game.players.values():
                if player.secret_mission == "TRAITOR":
                    player.score += 4 
                    break

    game.round_history.append({
        "cooperators": num_cooperate, 
        "traitors": num_betray, 
        "majority": "COOPERAR" if majority_is_cooperate else "TRAIR",
        "mission_success": mission_success,
        "noise_event": noise_event_triggered 
    })
    
    for player in game.players.values():
        player.current_choice = None
        player.secret_mission = None 
    
    if game.current_round >= 10:
        game.is_finished = True
        
        players_list = sorted(game.players.values(), key=lambda p: p.score, reverse=True)

        podium = [p.model_dump() for p in players_list[:3]]

        most_cooperative = max(players_list, key=lambda p: p.action_history.count("COOPERAR"))
        biggest_traitor = max(players_list, key=lambda p: p.action_history.count("TRAIR"))

        winner = players_list[0]
        coop_ratio = winner.action_history.count("COOPERAR") / len(winner.action_history) if winner.action_history else 0.5
        winner_title = "O Estrategista"
        if coop_ratio > 0.75:
            winner_title = "O Diplomata"
        elif coop_ratio < 0.25:
            winner_title = "O Tirano"

        game.game_results = {
            "podium": podium,
            "winner_title": winner_title,
            "most_cooperative": most_cooperative.model_dump(),
            "biggest_traitor": biggest_traitor.model_dump()
        }
    else:
        game.current_round += 1