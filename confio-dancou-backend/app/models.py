from pydantic import BaseModel
from typing import List, Dict, Literal

PlayerChoice = Literal["COOPERAR", "TRAIR"]
SecretMission = Literal["DEFAULT", "TRAITOR"]

class Player(BaseModel):
    id: str
    name: str
    score: int = 0
    current_choice: PlayerChoice | None = None
    secret_mission: SecretMission | None = None
    action_history: List[PlayerChoice] = []
    is_bot: bool = False 
    strategy: str | None = None

class GameState(BaseModel):
    game_id: str
    host_id: str
    players: Dict[str, Player] = {}
    current_round: int = 0
    round_history: List[Dict] = []
    is_started: bool = False
    is_finished: bool = False
    mission_rounds: List[int] = [4, 8]
    game_results: Dict | None = None

class GameCreationResponse(BaseModel):
    game_id: str
    host_id: str

class JoinGamePayload(BaseModel):
    player_name: str

class PlayerChoicePayload(BaseModel):
    player_id: str
    choice: PlayerChoice

class AddBotPayload(BaseModel):
    strategy: Literal["ALWAYS_COOPERATE", "ALWAYS_BETRAY", "RANDOM", "TIT_FOR_TAT"]
