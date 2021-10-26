import { ValueOf } from '~/utils/ValueOf';
import type { Command } from './Command';

export type Job = SingleJob | ChainJob | ClusterJob;

export const JobType = {
  single: 'single',
  chain: 'chain',
  cluster: 'cluster',
} as const;

export const JobBehaviorOnFailed = {
  stop: 'STOP',
  fail: 'FAIL',
  skip: 'SKIP',
} as const;
type JobBehaviorOnFailed = ValueOf<typeof JobBehaviorOnFailed>;

export type SingleJob = {
  type: 'single';
  command: Command;
  onSuccess?: Command;
  onFailed?: Command;
} & JobBase;

export type ChainJob = {
  type: 'chain';
  chainJobs: Job[];
  whenOneOfChainFailed: JobBehaviorOnFailed;
  onEnd?: Command;
} & JobBase;

export type ClusterJob = {
  type: 'cluster';
  jobCluster: Job[];
  // TODO: It's hard to stop running Promise so can't implement this option on ClusterJob. Consider using RxJS instead?
  // whenOneOfClusterFailed: JobBehaviorOnFailed;
  onEnd?: Command;
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
} & (
  | {
      status: 'succeeded' | 'failed';
      startedAt: Date;
      endedAt: Date;
    }
  | {
      status: 'waiting';
      startedAt?: undefined;
      endedAt?: undefined;
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
