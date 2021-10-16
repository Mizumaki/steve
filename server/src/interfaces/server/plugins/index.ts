import type { FastifyPluginCallback } from 'fastify';
import fp from 'fastify-plugin';
import { registerRepositoryPlugins } from './repository';

export const registerPlugins: FastifyPluginCallback = (app, _ops, next) => {
  void app.register(fp(registerRepositoryPlugins));
  next();
};
