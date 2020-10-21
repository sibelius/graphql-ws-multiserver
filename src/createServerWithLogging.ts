import { createServer } from 'graphql-transport-ws';

export const createServerWithLogging = ({
  schema,
  execute,
  subscribe,
                                        }, websocketOptionsOrServer: WebSocketServerOptions | WebSocketServer) => createServer(
  {
    schema,
    execute: async (args) => {
      console.log('Execute', args);
      const result = await execute(args);
      console.debug('Execute result', result);
      return result;
    },
    subscribe: async (args) => {
      console.log('Subscribe', args);
      const subscription = await subscribe(args);
      // NOTE: `subscribe` can sometimes return a single result, I dont consider it here for sake of simplicity
      return (async function* () {
        for await (const result of subscription) {
          console.debug('Subscribe yielded result', { args, result });
          yield result;
        }
      })();
    },
    onConnect: (ctx) => {
      console.log('Connect', ctx);
      return true; // default behaviour - permit all connection attempts
    },
    onComplete: (ctx, msg) => {
      console.debug('Complete', { ctx, msg });
    },
  },
  websocketOptionsOrServer,
);
