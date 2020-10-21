import http from 'http';

import WebSocket from 'ws';

export const createWebsocketMiddleware = (propertyName = 'ws', options) => {
  if (!options) options = {};
  if (options instanceof http.Server) options = { server: options };

  const wss = new WebSocket.Server({ ...options.wsOptions, noServer: true });

  const websocketMiddleware = async (ctx, next) => {
    const upgradeHeader = (ctx.request.headers.upgrade || '')
      .split(',')
      .map((s) => s.trim());

    if (~upgradeHeader.indexOf('websocket')) {
      ctx[propertyName] = () => new Promise((resolve) => {
        wss.handleUpgrade(
          ctx.req,
          ctx.request.socket,
          Buffer.alloc(0),
          resolve,
        );
        ctx.respond = false;
      });
      ctx.wss = wss;
    }

    await next();
  };

  websocketMiddleware.server = wss;
  return websocketMiddleware;
};
