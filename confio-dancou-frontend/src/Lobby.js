import React, { useState } from 'react';

const API_URL = 'http://127.0.0.1:8001';

function Lobby({ onGameJoined }) {
  const [playerName, setPlayerName] = useState('');
  const [gameId, setGameId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateGame = async () => {
    if (!playerName) {
      setError('Por favor, digite seu nome.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/game`, { method: 'POST' });
      const data = await response.json(); 
      
      await handleJoinGame(data.game_id, data.host_id);

    } catch (err) {
      setError('Erro ao criar o jogo. O servidor está rodando?');
      setIsLoading(false);
    }
  };

  const handleJoinGame = async (idToJoin = gameId, hostId = null) => {
    if (!playerName) {
      setError('Por favor, digite seu nome.');
      return;
    }
    if (!idToJoin) {
      setError('Por favor, digite o código da sala.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/game/${idToJoin}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_name: playerName }),
      });

      if (!response.ok) {
        throw new Error('Não foi possível entrar na sala. Verifique o código.');
      }

      const data = await response.json();
      
      onGameJoined({
        gameId: data.game_state.game_id,
        playerId: data.player_id,
        isHost: !!hostId,
        hostId: hostId,
      });

    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="lobby">
      <h1>Confiô, Dançou!</h1>
      <input
        type="text"
        placeholder="Seu nome"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
      />
      <div className="join-game">
        <input
          type="text"
          placeholder="Código da sala"
          value={gameId}
          onChange={(e) => setGameId(e.target.value.toLowerCase())}
        />
        <button onClick={() => handleJoinGame()} disabled={isLoading}>
          Entrar
        </button>
      </div>
      <p>ou</p>
      <button onClick={handleCreateGame} disabled={isLoading}>
        Criar Nova Sala
      </button>
      {isLoading && <p>Aguarde...</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default Lobby;