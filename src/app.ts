import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import cors from '@koa/cors';
import { koaPlayground } from "graphql-playground-middleware";
import graphqlHttp from "koa-graphql";
import { config } from "./config";
import { schema } from "./schema/schema";
import websocket from 'koa-easy-ws';
import logger from 'koa-logger';
import { createServer } from 'graphql-transport-ws';
import { execute, subscribe } from 'graphql';
import { createWebsocketMiddleware } from './websocketMiddleware';

const app = new Koa();
const router = new Router();

app.use(bodyParser());
app.use(logger());
app.use(cors({ maxAge: 86400, credentials: true }));
app.use(createWebsocketMiddleware());

router.get('/', ctx => {
  const info = [
    '/graphql - GraphiQL',
    '/playground - GraphQL Playground',
    '/status - Status server'
  ]

  ctx.status = 200;
  ctx.body = info.join('\n');
})
router.get("/status", (ctx) => {
  ctx.status = 200;
  ctx.body = "running";
});

router.all(
  "/playground",
  koaPlayground({
    endpoint: "/graphql",
  })
);

const appGraphQL =
  graphqlHttp(async (request: Request, ctx: Response, koaContext) => {
    return {
      graphiql: config.NODE_ENV !== "production",
      schema,
      rootValue: {
        request: ctx.req,
      },
      context: {
        koaContext,
      },
    };
  });

router.all("/graphql", appGraphQL);

router.all('/pure/ws', async (ctx) => {
  if (ctx.ws) {
    const socket = await ctx.ws();

    socket.send('ping');

    socket.on('message', (message) => {
      // eslint-disable-next-line
      console.log('message: ', message);

      socket.close();
    });
  }
});

router.all('/public/ws', async (ctx) => {
  if (ctx.wss) {
    ctx.wss.handleUpgrade(
      ctx.req,
      ctx.request.socket,
      Buffer.alloc(0),
      (ws) => {
        ctx.wss.emit('connection', ws, ctx.req);
      },
    );
    ctx.respond = false;

    createServer(
      {
        schema,
        execute,
        subscribe,
      },
      ctx.wss
    );
  }
});

router.all('/private/ws', async (ctx) => {
  if (ctx.wss) {
    ctx.wss.handleUpgrade(
      ctx.req,
      ctx.request.socket,
      Buffer.alloc(0),
      (ws) => {
        ctx.wss.emit('connection', ws, ctx.req);
      },
    );
    ctx.respond = false;

    createServer(
      {
        schema,
        execute,
        subscribe,
      },
      ctx.wss
    );
  }
})

app.use(router.routes()).use(router.allowedMethods());

export default app;
