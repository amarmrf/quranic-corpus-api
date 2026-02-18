import { buildServer } from './app/server.js';

const port = Number.parseInt(process.env.PORT ?? '6382', 10);

async function main(): Promise<void> {
  const app = await buildServer();
  await app.listen({
    host: '0.0.0.0',
    port
  });
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
