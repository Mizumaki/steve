import type { Command } from "./Command";

export type Job = SingleJob | ChainJob | ClusterJob;

export type SingleJob = {
  command: Command;
} & JobBase;

export type ChainJob = {
  chainJobs: {
    [index: number]: Job;
  };
} & JobBase;

export type ClusterJob = {
  jobCluster: Job[];
} & JobBase;

export const JobStatus = {
  succeed: 'succeed',
  failed: 'failed',
  pending: 'pending',
  beforeStart: 'before-start',
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
      status: 'succeed' | 'failed';
      startedAt: Date;
      endedAt: Date;
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
