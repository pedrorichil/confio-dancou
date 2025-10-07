
import React, { useState, useEffect, useRef } from 'react';
import GameOverScreen from './GameOverScreen';

const API_URL = 'http://127.0.0.1:8001';
const ROUND_DURATION = 20;

const SecretMissionDisplay = ({ mission }) => {
  if (!mission) {
    return null;
  }

  if (mission === 'TRAITOR') {
    return (
      <div className="mission traitor-mission">
        <h3>Sua Missão Secreta!</h3>
        <p>Faça a <strong>maioria trair</strong> nesta rodada para ganhar <strong>+4 pontos bônus!</strong></p>
      </div>
    );
  }

  return (
    <div className="mission">
      <h3>Missão Secreta Ativa!</h3>
      <p>Cuidado: um <strong>traidor secreto</strong> foi designado e seu objetivo é fazer o grupo fracassar!</p>
    </div>
  );
};

function GameRoom({ gameId, playerId, isHost, hostId, onPlayAgain }) {
  const [gameState, setGameState] = useState(null);
  const [votedPlayers, setVotedPlayers] = useState(new Set());
  const [lastRoundResult, setLastRoundResult] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const socketRef = useRef(null);
  const [timerKey, setTimerKey] = useState(0); 
  const [scoreUpdate, setScoreUpdate] = useState(null);


  useEffect(() => {
    if (!socketRef.current) {
      const ws = new WebSocket(`ws://127.0.0.1:8001/ws/${gameId}/${playerId}`);
      socketRef.current = ws;

      ws.onopen = () => console.log('WebSocket Conectado!');
      ws.onclose = () => console.log('WebSocket Desconectado.');

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('Mensagem do servidor:', message);

        const { type, payload } = message;

        switch (type) {
          case 'WELCOME':
          case 'PLAYER_JOINED':
          case 'PLAYER_DISCONNECTED':
            if (payload) setGameState(payload);
            break;

          case 'ROUND_START':
            if (payload) setGameState(payload);
            setHasVoted(false);
            setVotedPlayers(new Set());
            setTimerKey(prevKey => prevKey + 1); 
            setLastRoundResult(payload.round_history[payload.round_history.length - 1] || null);
            break;
          
          case 'ROUND_END':
             if (payload) {
                const updatedScores = {};
                for (const p_id in payload.players) {
                    if (gameState && gameState.players[p_id] && gameState.players[p_id].score !== payload.players[p_id].score) {
                        updatedScores[p_id] = 'updated';
                    }
                }
                setScoreUpdate(updatedScores);
                setGameState(payload);
             }
            setLastRoundResult(payload.round_history[payload.round_history.length - 1]);
            setTimeout(() => setScoreUpdate(null), 1000);
            break;

          case 'GAME_OVER':
            if (payload) setGameState(payload);
            break;

          case 'PLAYER_VOTED':
            if (payload && payload.player_id) {
              setVotedPlayers(prev => new Set(prev).add(payload.player_id));
            }
            break;

          default:
            break;
        }
      };
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [gameId, playerId]);

  const handlePlayerChoice = (choice) => {
    if (socketRef.current) {
      socketRef.current.send(JSON.stringify({ action: 'CHOOSE', choice }));
      setHasVoted(true);
    }
  };

  const handleAddBot = async (strategy) => {
    try {
      await fetch(`${API_URL}/game/${gameId}/add_bot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategy: strategy }),
      });
    } catch (error) {
      console.error("Erro ao adicionar bot:", error);
    }
  };
  
  const handleStartGame = async () => {
    setIsStarting(true);
    if (isHost && hostId) {
      try {
        await fetch(`${API_URL}/game/${gameId}/start?host_id=${hostId}`, { method: 'POST' });
      } catch (error) {
        console.error("Erro ao iniciar o jogo:", error);
        setIsStarting(false);
      }
    }
  };

  if (!gameState || !gameState.players) {
    return <div>Carregando informações da sala...</div>;
  }

  const me = gameState.players[playerId];
  if (!me) {
    return <div>Erro: Você não foi encontrado na sala. Tentando reconectar...</div>;
  }

  if (gameState.is_finished) {
    return <GameOverScreen gameState={gameState} onPlayAgain={onPlayAgain} />;
  }

  return (
    <div className="game-room">
      <header>
        <h1>Sala: {gameId}</h1>
        <h2>Rodada: {gameState.current_round}</h2>
        <h3>{me.name} (Você) | Pontos: {me.score}</h3>
      </header>

      {gameState.is_started && !gameState.is_finished && (
        <div className="timer-bar" key={timerKey}>
          <div className="timer-bar-progress" style={{ animationDuration: `${ROUND_DURATION}s` }}></div>
        </div>
      )}
      
      <main>
        <SecretMissionDisplay mission={me.secret_mission} />
        <div className="players-list">
          <h3>Jogadores:</h3>
          <ul>
            {Object.values(gameState.players).map(p => (
              <li key={p.id} className={votedPlayers.has(p.id) ? 'voted' : ''}>
                {p.name} {p.id === playerId && '(Você)'} - {p.score} pts
                {votedPlayers.has(p.id) && ' ✅'}
              </li>
            ))}
          </ul>
        </div>
        
        {lastRoundResult && (
          <div className="last-result">
            <h4>Resultado da Última Rodada:</h4>
            <p>{lastRoundResult.cooperators} cooperaram | {lastRoundResult.traitors} traíram.</p>
            <p>A maioria escolheu: <strong>{lastRoundResult.majority}</strong></p>
            {lastRoundResult.mission_success === true && 
              <p className="mission-result success">
                Missão Cumprida! A maioria traiu, garantindo pontos bônus para o traidor secreto.
              </p>
            }
            {lastRoundResult.mission_success === false && 
              <p className="mission-result fail">
                Missão Falhou! A maioria cooperou, e o traidor secreto não ganhou seus pontos bônus.
              </p>
            }
            {lastRoundResult.noise_event && (
              <div className="noise-alert">
                <strong>Alerta!</strong> Houve um "ruído na comunicação" e a jogada de um jogador foi invertida aleatoriamente!
              </div>
            )}
          </div>
        )}
      </main>

      <footer>
        {!gameState.is_started && isHost && (
          <button 
            onClick={handleStartGame} 
            className="start-button" 
            disabled={isStarting}
          >
            {isStarting ? 'Iniciando...' : 'Começar o Jogo'}
          </button>
        )}
        {gameState.is_started && !gameState.is_finished && (
          <div className="actions">
            {!hasVoted ? (
              <>
                <p>Faça sua escolha:</p>
                <button onClick={() => handlePlayerChoice('COOPERAR')}>🤝 Cooperar</button>
                <button onClick={() => handlePlayerChoice('TRAIR')}>🔪 Trair</button>
              </>
            ) : (
              <p>Você já votou. Aguardando os outros jogadores...</p>
            )}
          </div>
        )}
        {!gameState.is_started && (
          <div className="pre-game-lobby">
            {isHost ? (
              <div className="host-controls">
                <h4>Adicionar Bots:</h4>
                <div className="bot-buttons">
                  <button onClick={() => handleAddBot('TIT_FOR_TAT')}>🧐 Rancoroso</button>
                  <button onClick={() => handleAddBot('RANDOM')}>🤪 Caótico</button>
                  <button onClick={() => handleAddBot('ALWAYS_COOPERATE')}>😇 Anjo</button>
                  <button onClick={() => handleAddBot('ALWAYS_BETRAY')}>😈 Demônio</button>
                </div>
                <button 
                  onClick={handleStartGame} 
                  className="start-button" 
                  disabled={isStarting || Object.keys(gameState.players).length < 2}
                >
                  {isStarting ? 'Iniciando...' : 'Começar Jogo (mín. 2 jogadores)'}
                </button>
              </div>
            ) : (
              <p>Aguardando o Host iniciar a partida...</p>
            )}
          </div>
        )}
        {gameState.is_finished && <h2>Fim de Jogo!</h2>}
      </footer>
    </div>
  );
}

export default GameRoom;