import type { FastifyInstance } from 'fastify';

export const decorateFastifyInstance = <T extends keyof FastifyInstance>(
  property: T,
  value: FastifyInstance[T],
  fastify: FastifyInstance
) => fastify.decorate(property, value);
