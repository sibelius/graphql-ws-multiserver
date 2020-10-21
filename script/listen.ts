import { createClient, SubscribePayload } from 'graphql-transport-ws';
import WebSocket from 'ws';

const client = createClient({
  url: 'ws://localhost:5566/public/ws',
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
  try {
    console.log('listening');
    const result = await execute({
      query: '{ version }',
    });
    // complete
    // next = result = { data: { hello: 'Hello World!' } }

    console.log({
      result,
    });
  } catch (err) {
    // error
    console.log({
      err,
    });
  }
})();
