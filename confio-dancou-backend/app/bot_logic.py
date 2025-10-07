import random
from .models import GameState, Player, PlayerChoice

def get_bot_choice(player: Player, game: GameState) -> PlayerChoice:
    """Decide a jogada de um bot com base em sua estratégia."""
    strategy = player.strategy
    
    if strategy == "ALWAYS_COOPERATE":
        return "COOPERAR"
    
    if strategy == "ALWAYS_BETRAY":
        return "TRAIR"
        
    if strategy == "RANDOM":
        return random.choice(["COOPERAR", "TRAIR"])
        
    if strategy == "TIT_FOR_TAT":
        if game.current_round == 1 or not game.round_history:
            return "COOPERAR"
        
        last_round = game.round_history[-1]
        if last_round["majority"] == "COOPERAR":
            return "COOPERAR"
        else:
            return "TRAIR"
            
    return "COOPERAR"

def make_bot_choices(game: GameState):
    """Itera sobre todos os jogadores e faz as escolhas para os que são bots."""
    for player in game.players.values():
        if player.is_bot:
            player.current_choice = get_bot_choice(player, game)