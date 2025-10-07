import React, { useState } from 'react';
import Lobby from './Lobby';
import GameRoom from './GameRoom';
import GameOverScreen from './GameOverScreen';
import './App.css';

function App() {
  const [gameInfo, setGameInfo] = useState(null);

  const handleGameJoined = (info) => {
    setGameInfo(info);
  };

  const handlePlayAgain = () => {
    setGameInfo(null);
  };

  return (
    <div className="App">
      {!gameInfo ? (
        <Lobby onGameJoined={handleGameJoined} />
      ) : (
        <GameRoom
          gameId={gameInfo.gameId}
          playerId={gameInfo.playerId}
          isHost={gameInfo.isHost}
          hostId={gameInfo.hostId}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}

export default App;