import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

// Vote data storage
const votes = {
  baseball: 0,
  basketball: 0,
  hockey: 0,
  rugby: 0,
  soccer: 0
};

// Broadcast vote data to all connected clients
function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

wss.on('connection', (ws) => {
  console.log('새로운 클라이언트가 연결되었습니다');

  // Send current vote data to new client
  ws.send(JSON.stringify({
    type: 'votes',
    data: votes
  }));

  ws.on('message', (message) => {
    try {
      const { type, option } = JSON.parse(message);

      if (type === 'vote' && votes.hasOwnProperty(option)) {
        votes[option]++;
        console.log(`${option}에 투표되었습니다. 현재 득표수: ${votes[option]}`);

        // Broadcast updated votes to all clients
        broadcast({
          type: 'votes',
          data: votes
        });
      }
    } catch (error) {
      console.error('메시지 처리 오류:', error);
    }
  });

  ws.on('close', () => {
    console.log('클라이언트 연결이 종료되었습니다');
  });
});

console.log('WebSocket 서버가 포트 8080에서 실행 중입니다');