import { runServer } from './interfaces/server';
import { getRedis } from './utils/redis';

const port = Number(process.env['PORT']);
const redisPort = Number(process.env['REDIS_PORT']);

if (!port || !redisPort) {
  throw new Error(`Required environment variables is missing: port: ${port}, redisPort: ${redisPort}`);
}

const redis = getRedis({ port: redisPort });
redis.on('error', e => {
  throw new Error(`Redis Connection Error Ocurred: ${(e as unknown) as string}`);
});
if (process.env['NODE_ENV'] !== 'release') {
  // For local development, flush DB data when launch the server
  void redis.flushdb();
}

runServer({
  port,
  redisConf: {
    port: redisPort,
    host: '127.0.0.1',
  },
});
