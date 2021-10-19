import { Job } from '~/entity/Job';

export type JobQueueRepositoryInterface = {
  getQueues: () => Promise<Job[]>;
  registerJob: (job: Job, options?: { prioritize?: boolean }) => Promise<void>;
};
