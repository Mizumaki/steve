import { FastifyPluginCallback } from 'fastify';
import fp from 'fastify-plugin';
import Queue from 'bull';
import { decorateFastifyInstance } from '~/utils/fastify/decorateFastifyInstance';
import { JobHistoryRepository } from './JobHistory';
import { JobQueueRepository } from './JobQueue';
import { Job } from '~/entity/Job';

const decorateJobHistoryRepository: FastifyPluginCallback = (fastify, _opts, done) => {
  decorateFastifyInstance('jobHistoryRepository', new JobHistoryRepository(), fastify);
  done();
};

const decorateJobQueueRepository: FastifyPluginCallback = (fastify, _opts, done) => {
  const jobQueue = new Queue<Job>('jobQueue', {
    redis: {
      port: fastify.redisPort,
      host: '127.0.0.1',
    },
  });

  decorateFastifyInstance('jobQueueRepository', new JobQueueRepository(jobQueue), fastify);
  done();
};

export const registerRepositoryPlugins: FastifyPluginCallback = (app, _opts, next) => {
  void app.register(fp(decorateJobHistoryRepository));
  void app.register(fp(decorateJobQueueRepository));
  next();
};
