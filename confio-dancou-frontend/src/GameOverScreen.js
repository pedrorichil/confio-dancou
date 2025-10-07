import React from 'react';

const PodiumPlace = ({ player, place }) => {
  const medals = ['🥇', '🥈', '🥉'];
  return (
    <div className={`podium-place place-${place}`}>
      <div className="medal">{medals[place - 1]}</div>
      <div className="player-name">{player.name}</div>
      <div className="player-score">{player.score} Pontos</div>
    </div>
  );
};

function GameOverScreen({ gameState, onPlayAgain }) {
  const { game_results, players } = gameState;
  if (!game_results) return <div>Calculando resultados...</div>;

  const { podium, winner_title, most_cooperative, biggest_traitor } = game_results;
  const winner = podium[0];

  return (
    <div className="game-over-screen">
      <h2>Fim de Jogo!</h2>
      
      <div className="winner-announcement">
        <h3>{winner.name}</h3>
        <p>é o vencedor com o título de</p>
        <h2>{winner_title}</h2>
      </div>

      <div className="podium">
        {podium[1] && <PodiumPlace player={podium[1]} place={2} />}
        {podium[0] && <PodiumPlace player={podium[0]} place={1} />}
        {podium[2] && <PodiumPlace player={podium[2]} place={3} />}
      </div>

      <div className="awards">
        <h4>Títulos Honorários</h4>
        <p>🤝 <strong>O Mais Cooperativo:</strong> {most_cooperative.name}</p>
        <p>🔪 <strong>O Maior Traidor:</strong> {biggest_traitor.name}</p>
      </div>

      <button onClick={onPlayAgain} className="play-again-button">
        Jogar Novamente
      </button>
    </div>
  );
}

export default GameOverScreen;