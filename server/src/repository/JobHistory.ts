import type { Job } from '~/entity/Job';

export type JobHistoryRepositoryInterface = {
  getJobs: () => Promise<Job[]>;
  getJob: (jobId: Job['id']) => Promise<Job>;
  addJob: (job: Omit<Job, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateJob: (jobId: Job['id'], updatedColumns: Partial<Job>) => Promise<void>;
};
