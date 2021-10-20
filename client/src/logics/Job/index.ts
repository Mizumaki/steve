export type Command = string;

export type Job = SingleJob | ChainJob | ClusterJob;

export type SingleJob = {
  type: 'single';
  command: Command;
} & JobBase;

export type ChainJob = {
  type: 'chain';
  chainJobs: Job[];
} & JobBase;

export type ClusterJob = {
  type: 'cluster';
  jobCluster: Job[];
} & JobBase;

export const JobStatus = {
  beforeStart: 'before-start',
  ongoing: 'ongoing',
  pending: 'pending',
  succeeded: 'succeeded',
  failed: 'failed',
} as const;
type JobStatus = typeof JobStatus[keyof typeof JobStatus];

type JobBase = {
  id: string;
  name: string;
  createdAt: Date;
  onSuccess?: Command;
  onFailed?: Command;
} & (
  | {
      status: 'succeeded' | 'failed';
      startedAt: Date;
      endedAt: Date;
    }
  | {
      status: 'ongoing';
      startedAt: Date;
      endedAt?: undefined;
    }
  | {
      status: 'pending';
      startedAt: Date;
      endedAt?: undefined;
    }
  | {
      status: 'before-start';
      startedAt?: undefined;
      endedAt?: undefined;
    }
);
