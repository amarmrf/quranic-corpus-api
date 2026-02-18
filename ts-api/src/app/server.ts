import Fastify from 'fastify';
import cors from '@fastify/cors';
import { buildContext } from './context.js';
import { registerRoutes } from './routes.js';

export async function buildServer() {
  const app = Fastify({
    logger: true
  });

  await app.register(cors, {
    origin: true
  });

  const context = buildContext();
  await registerRoutes(app, context);

  return app;
}
