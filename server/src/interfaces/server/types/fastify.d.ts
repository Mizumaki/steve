/// <reference types="fastify" />
import { JobHistoryRepositoryInterface } from '~/repository/JobHistory';

declare module 'fastify' {
  interface FastifyInstance {
    jobHistoryRepository: JobHistoryRepositoryInterface;
  }
}
