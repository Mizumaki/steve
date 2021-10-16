import { Job } from '~/entity/Job';

export type JobQueueRepositoryInterface = {
  getQueues: () => Promise<Job[]>;
  registerJob: (job: Job) => Promise<void>;
};
