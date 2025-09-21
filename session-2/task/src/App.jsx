import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [votes, setVotes] = useState({
    baseball: 0,
    basketball: 0,
    hockey: 0,
    rugby: 0,
    soccer: 0
  });
  const [ws, setWs] = useState(null);
  const [connected, setConnected] = useState(false);

  const voteOptions = [
    { key: 'baseball', label: '⚾ 야구', color: '#3b82f6' },
    { key: 'basketball', label: '🏀 농구', color: '#ef4444' },
    { key: 'hockey', label: '🏒 하키', color: '#8b5cf6' },
    { key: 'rugby', label: '🏉 럭비', color: '#f59e0b' },
    { key: 'soccer', label: '⚽ 축구', color: '#10b981' }
  ];

  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:8080');

    websocket.onopen = () => {
      console.log('WebSocket 연결됨');
      setConnected(true);
      setWs(websocket);
    };

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'votes') {
        setVotes(message.data);
      }
    };

    websocket.onclose = () => {
      console.log('WebSocket 연결 종료됨');
      setConnected(false);
      setWs(null);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket 오류:', error);
    };

    return () => {
      websocket.close();
    };
  }, []);

  const handleVote = (option) => {
    if (ws && connected) {
      ws.send(JSON.stringify({
        type: 'vote',
        option: option
      }));
    }
  };

  const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);

  return (
    <div className="app">
      <h1>실시간 투표 앱</h1>
      <div className="connection-status">
        상태: {connected ? '🟢 연결됨' : '🔴 연결 끊김'}
      </div>

      <div className="vote-results">
        <h2>투표 결과 (총 {totalVotes}표)</h2>
        <div className="vote-bars">
          {voteOptions.map(option => (
            <div key={option.key} className="vote-bar-container">
              <div className="vote-info">
                <span className="vote-label">{option.label}</span>
                <span className="vote-count">{votes[option.key]}표</span>
              </div>
              <div className="vote-bar">
                <div
                  className="vote-bar-fill"
                  style={{
                    width: totalVotes > 0 ? `${(votes[option.key] / totalVotes) * 100}%` : '0%',
                    backgroundColor: option.color
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="voting-buttons">
        <h2>투표하기</h2>
        <div className="buttons-grid">
          {voteOptions.map(option => (
            <button
              key={option.key}
              className="vote-button"
              style={{ backgroundColor: option.color }}
              onClick={() => handleVote(option.key)}
              disabled={!connected}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
