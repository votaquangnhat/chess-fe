import React, { useState, useEffect } from 'react';
import Chessboard from 'chessboardjsx';
import { io } from 'socket.io-client';

//const socket = io('https://chess-backend-yot6.onrender.com'); 
//const socket = io("https://chess-backend-yot6.onrender.com", {transports: ["websocket"],});
//const socket = io('http://127.0.0.1:5000/'); 
const socket = io('https://vtqn-chess-backend.fayedark.com')

const App = () => {
  const [position, setPosition] = useState('start');
  const [whiteMode, setWhiteMode] = useState('Human');
  const [blackMode, setBlackMode] = useState('Human');
  const [currentTurn, setCurrentTurn] = useState('white');
  const [gameStarted, setGameStarted] = useState(false);
  const [aiDelay, setAiDelay] = useState(0);

  useEffect(() => {
    socket.on('update', (data) => {
      setPosition(data.fen);
      setCurrentTurn(data.turn);
      console.log(data.message)
    });

    socket.on('error', (data) => {
      console.error('Error:', data.message);
    });

    socket.emit('reset');

    return () => {
      socket.off('update');
      socket.off('error');
    };
  }, []);

  const handleMove = ({ sourceSquare, targetSquare }) => {
    if (gameStarted && ((currentTurn === 'white' && whiteMode === 'Human') || (currentTurn === 'black' && blackMode === 'Human'))) {
      socket.emit('move', { from: sourceSquare, to: targetSquare });
    }
  };

  const handleReset = () => {
    setGameStarted(false);
    socket.emit('reset');
  };

  const requestAIMove = (turn, mode) => {
    setTimeout(() => {
      if (gameStarted) {
        socket.emit('ai_move', { turn, mode });
      }
    }, aiDelay);
  };

  useEffect(() => {
    if (gameStarted) {
      if (currentTurn === 'white' && whiteMode !== 'Human') {
        requestAIMove('white', whiteMode);
      } else if (currentTurn === 'black' && blackMode !== 'Human') {
        requestAIMove('black', blackMode);
      }
    }
  }, [currentTurn, whiteMode, blackMode, gameStarted]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
      <h1>Chess Game</h1>
      <p>Press Start to be able to play</p>
      <div style={{ marginBottom: '20px' }}>
        <label>
          White Mode:
          <select value={whiteMode} onChange={(e) => setWhiteMode(e.target.value)} style={{ marginLeft: '10px' }}>
            <option value="Human">Human</option>
            <option value="Minimax">Minimax</option>
            <option value="AlphaBeta">Alpha-Beta</option>
            <option value="MCTS">MCTS</option>
            <option value="MCTS_NN">MCTS + NN</option>
          </select>
        </label>
        <label style={{ marginLeft: '20px' }}>
          Black Mode:
          <select value={blackMode} onChange={(e) => setBlackMode(e.target.value)} style={{ marginLeft: '10px' }}>
            <option value="Human">Human</option>
            <option value="Minimax">Minimax</option>
            <option value="AlphaBeta">Alpha-Beta</option>
            <option value="MCTS">MCTS</option>
            <option value="MCTS_NN">MCTS + NN</option>
          </select>
        </label>
      </div>
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setGameStarted(true)}
          style={{ padding: '10px 20px', fontSize: '16px' }}
          disabled={gameStarted}
        >
          Start
        </button>
        <button onClick={handleReset} style={{ padding: '10px 20px', fontSize: '16px' }}>
          Play Again
        </button>
        <label style={{ padding: '10px 20px', fontSize: '16px' }}>
          AI Delay (ms):
          <input
            type="number"
            value={aiDelay}
            onChange={(e) => setAiDelay(Number(e.target.value))}
            style={{ marginLeft: '10px', width: '80px' }}
            min="0"
          />
        </label>
      </div>
      <Chessboard position={position} onDrop={handleMove} draggablePieces={gameStarted} />
    </div>
  );
};

export default App;
