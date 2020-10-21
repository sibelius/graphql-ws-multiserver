import { createClient, SubscribePayload } from 'graphql-transport-ws';
import WebSocket from 'ws';


const client = createClient({
  url: 'ws://localhost:5566/pure/ws',
  webSocketImpl: WebSocket,
});

async function execute<T>(payload: SubscribePayload) {
  return new Promise((resolve, reject) => {
    let result: T;
    client.subscribe<T>(payload, {
      next: (data) => {
        result = data;
        console.log('next', {
          data,
        })
      },
      error: reject,
      complete: () => {
        console.log('complete');
        return resolve(result)
      },
    });
  });
}

// use
(async () => {
  const ws = new WebSocket('ws://localhost:5566/pure/ws');

  ws.on('message', (message) => {
    console.log('message: ', message);

    ws.send('pong');
  });
})();
