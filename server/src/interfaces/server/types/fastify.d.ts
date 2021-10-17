/// <reference types="fastify" />
import type { JobHistoryRepositoryInterface } from '~/repository/JobHistory';
import type { JobQueueRepositoryInterface } from '~/repository/JobQueue';

declare module 'fastify' {
  interface FastifyInstance {
    redis: {
      host: string;
      port: number;
    };
    jobHistoryRepository: JobHistoryRepositoryInterface;
    jobQueueRepository: JobQueueRepositoryInterface;
  }
}
