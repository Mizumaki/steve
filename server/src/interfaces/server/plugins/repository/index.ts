import { FastifyPluginCallback } from 'fastify';
import fp from 'fastify-plugin';
import { decorateFastifyInstance } from '~/utils/fastify/decorateFastifyInstance';
import { JobHistoryRepository } from './JobHistory';
import { JobQueueRepository } from './JobQueue';

const decorateJobHistoryRepository: FastifyPluginCallback = (fastify, _opts, done) => {
  decorateFastifyInstance('jobHistoryRepository', new JobHistoryRepository(), fastify);
  done();
};

const decorateJobQueueRepository: FastifyPluginCallback = (fastify, _opts, done) => {
  decorateFastifyInstance(
    'jobQueueRepository',
    new JobQueueRepository({
      redisConf: {
        port: fastify.redis.port,
        host: fastify.redis.host,
      },
    }),
    fastify
  );
  done();
};

export const registerRepositoryPlugins: FastifyPluginCallback = (app, _opts, next) => {
  void app.register(fp(decorateJobHistoryRepository));
  void app.register(fp(decorateJobQueueRepository));
  next();
};
