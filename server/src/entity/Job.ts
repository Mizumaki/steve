import type { Command } from './Command';

export type Job = SingleJob | ChainJob | ClusterJob;

export type SingleJob = {
  type: 'single';
  command: Command;
} & JobBase;

export type ChainJob = {
  type: 'chain';
  chainJobs: {
    [index: number]: Job;
  };
} & JobBase;

export type ClusterJob = {
  type: 'cluster';
  jobCluster: Job[];
} & JobBase;

export const JobStatus = {
  /**
   * 'before-start' means the Job is not started yet.
   * (Not registered in Process Queue)
   */
  beforeStart: 'before-start',
  /**
   * 'waiting' means the Job is waiting to start.
   * (Registered in Process Queue and wait to be handled)
   */
  waiting: 'waiting',
  /**
   * 'ongoing' means the Job process is ongoing.
   * (Process Queue is handling the Job)
   */
  ongoing: 'ongoing',
  /**
   * 'pending' means the Job process is stopped manually.
   * (You can re-start the Job from where it stopped)
   * (Only enables in ChainJob or ClusterJob)
   */
  pending: 'pending',
  /**
   * 'succeeded' means the Job process is successfully ended.
   */
  succeeded: 'succeeded',
  /**
   * 'failed' means the Job process is failed.
   * (You have to re-register the Job to restart)
   */
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
