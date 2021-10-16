import Redis from 'ioredis';

export const getRedis = ({ port }: { port: number }): Redis.Redis => {
  const redis = new Redis(port);
  redis.on('error', e => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.error(`Redis Connection Error Ocurred: ${e}`);
    process.exit(-1);
  });

  return redis;
};
