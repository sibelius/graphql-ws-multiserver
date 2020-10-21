import http from 'http';
import app from './app';
import { config } from './config';
import { execute, subscribe } from 'graphql';
import { schema } from './schema/schema';
import { createServer } from 'graphql-transport-ws';

(async () => {
  const server = http.createServer(app.callback());

  const wsConfig = {
    server,
    path: '/ws',
  };

  server.listen(config.PORT, () => {
    console.log(`server running at http://localhost:${config.PORT}`);

    // TODO - improve multiserver ws
    createServer(
      {
        schema,
        execute,
        subscribe,
      },
      {
        server,
        path: '/public/ws',
      }
    );

    // TODO - improve multiserver ws
    createServer(
      {
        schema,
        execute,
        subscribe,
      },
      {
        server,
        path: '/private/ws',
      }
    );
  });
})();
