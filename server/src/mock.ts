import type { Job } from './entity/Job';
import { ulid } from 'ulid';

const singleJob = () =>
  ({
    id: ulid(),
    name: '単一Job',
    command: 'curl localhost:8080',
    status: 'pending',
    createdAt: new Date(),
    startedAt: new Date(),
  } as const);

const chainJob1 = () =>
  ({
    id: ulid(),
    name: 'チェーンJob',
    chainJobs: {
      0: singleJob(),
      1: singleJob(),
    },
    status: 'pending',
    createdAt: new Date(),
    startedAt: new Date(),
  } as const);

const clusterJob1 = () =>
  ({
    id: ulid(),
    name: 'クラスターJob',
    jobCluster: [singleJob(), chainJob1()] as Job[],
    status: 'pending',
    createdAt: new Date(),
    startedAt: new Date(),
  } as const);

const chainJob2 = () =>
  ({
    id: ulid(),
    name: 'チェーンJob2',
    chainJobs: {
      0: singleJob(),
      1: chainJob1(),
      2: clusterJob1(),
    },
    status: 'pending',
    createdAt: new Date(),
    startedAt: new Date(),
  } as const);

const clusterJob2 = () =>
  ({
    id: ulid(),
    name: 'クラスターJob2',
    jobCluster: [singleJob(), chainJob1(), clusterJob1()] as Job[],
    status: 'pending',
    createdAt: new Date(),
    startedAt: new Date(),
  } as const);

export const mock = (): Job[] => {
  const jobs: Job[] = [singleJob(), chainJob1(), clusterJob1(), chainJob2(), clusterJob2()];
  return jobs;
};
