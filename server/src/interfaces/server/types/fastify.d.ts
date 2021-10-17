/// <reference types="fastify" />
import { JobHistoryRepositoryInterface } from '~/repository/JobHistory';
import { JobQueueRepositoryInterface } from '~/repository/JobQueue';

declare module 'fastify' {
  interface FastifyInstance {
    redisPort: number;
    jobHistoryRepository: JobHistoryRepositoryInterface;
    jobQueueRepository: JobQueueRepositoryInterface;
  }
}
