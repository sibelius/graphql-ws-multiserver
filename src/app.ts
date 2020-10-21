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

const app = new Koa();
const router = new Router();

app.use(bodyParser());
app.use(logger());
app.use(cors({ maxAge: 86400, credentials: true }));
app.use(websocket());

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

app.use(router.routes()).use(router.allowedMethods());

export default app;
