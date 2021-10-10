export type Job = SingleJob | ChainJob | ClusterJob;

export type SingleJob = {
  command: string;
} & JobBase;

export type ChainJob = {
  jobs: {
    [index: number]: Job;
  };
} & JobBase;

export type ClusterJob = {
  jobs: Job[];
} & JobBase;

export const JobStatus = {
  succeed: 'succeed',
  failed: 'failed',
  pending: 'pending',
  beforeStart: 'before-start',
} as const;
type JobStatus = typeof JobStatus[keyof typeof JobStatus];

type JobBase = {
  name: string;
  createdAt: Date;
  onSuccess: () => Promise<void>;
  onFailed: () => Promise<void>;
} & (
  | {
      status: 'succeed' | 'failed';
      endedAt: Date;
    }
  | {
      status: 'pending' | 'before-start';
      endedAt?: undefined;
    }
);
