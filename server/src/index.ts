import { runServer } from './interfaces/server';

const port = Number(process.env['PORT']);
const redisPort = Number(process.env['REDIS_PORT']);

if (!port || !redisPort) {
  throw new Error(`Required environment variables is missing: port: ${port}, redisPort: ${redisPort}`);
}

runServer({
  port,
  redisConf: {
    port: redisPort,
    host: '127.0.0.1',
  },
});
