import { FastifyPluginCallback } from 'fastify';
import fp from 'fastify-plugin';
import { decorateFastifyInstance } from '~/utils/fastify/decorateFastifyInstance';
import { JobHistoryRepository } from './JobHistory';

const decorateJobHistoryRepository: FastifyPluginCallback = (fastify, _opts, done) => {
  decorateFastifyInstance('jobHistoryRepository', new JobHistoryRepository(), fastify);
  done();
};

export const registerRepositoryPlugins: FastifyPluginCallback = (app, _opts, next) => {
  void app.register(fp(decorateJobHistoryRepository));
  next();
};
