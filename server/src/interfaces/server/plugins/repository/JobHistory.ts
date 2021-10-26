import { Job } from '~/entity/Job';
import { JobHistoryRepositoryInterface } from '~/repository/JobHistory';

// TODO: Replace by permanent store (like Redis)
const jobs: Job[] = mock();

export class JobHistoryRepository implements JobHistoryRepositoryInterface {
  async getJobs() {
    return Promise.resolve(jobs);
  }

  async getJob(jobId: Job['id']) {
    // TODO: 本来は、jobs の子の job も含めて検索の必要あり
    const job = jobs.find(j => j.id === jobId);
    if (job === undefined) {
      // TODO: Handle Error Well
      throw new Error('Not Found');
    }
    return Promise.resolve(job);
  }

  async addJob(jobData: Omit<Job, 'id' | 'createdAt' | 'status'>) {
    const job = genJobMock({ ...jobData, status: 'before-start' });
    jobs.push(job);
    return Promise.resolve();
  }

  async updateJob(jobId: Job['id'], updatedColumns: Partial<Job>) {
    // TODO: 本来は、jobs の子の job も含めて検索 & 更新の必要あり
    const jobIndex = jobs.findIndex(v => v.id === jobId);
    if (jobIndex === -1) {
      // TODO: Handle Error Well
      throw new Error('Not Found');
    }
    // TODO: Confirm `updatedColumns` が `jobId` の示す job に対して正しいプロパティのみを保持しているいこと
    jobs[jobIndex] = { ...jobs[jobIndex], ...updatedColumns } as Job;
    return Promise.resolve();
  }
}

import { ulid } from 'ulid';

function singleJob() {
  return {
    id: ulid(),
    type: 'single',
    name: '単一Job',
    command: 'curl localhost:8080',
    status: 'pending',
    createdAt: new Date(),
    startedAt: new Date(),
  } as const;
}

function chainJob1() {
  return {
    id: ulid(),
    type: 'chain',
    name: 'チェーンJob',
    chainJobs: [singleJob(), singleJob()] as Job[],
    whenOneOfChainFailed: 'STOP',
    status: 'pending',
    createdAt: new Date(),
    startedAt: new Date(),
  } as const;
}

function clusterJob1() {
  return {
    id: ulid(),
    type: 'cluster',
    name: 'クラスターJob',
    jobCluster: [singleJob(), chainJob1()] as Job[],
    status: 'pending',
    createdAt: new Date(),
    startedAt: new Date(),
  } as const;
}

function chainJob2() {
  return {
    id: ulid(),
    type: 'chain',
    name: 'チェーンJob2',
    chainJobs: [singleJob(), chainJob1(), clusterJob1()] as Job[],
    whenOneOfChainFailed: 'STOP',
    status: 'pending',
    createdAt: new Date(),
    startedAt: new Date(),
  } as const;
}

function clusterJob2() {
  return {
    id: ulid(),
    type: 'cluster',
    name: 'クラスターJob2',
    jobCluster: [singleJob(), chainJob1(), clusterJob1()] as Job[],
    status: 'pending',
    createdAt: new Date(),
    startedAt: new Date(),
  } as const;
}

function mock(): Job[] {
  const jobs: Job[] = [singleJob(), chainJob1(), clusterJob1(), chainJob2(), clusterJob2()];
  return jobs;
}

function genJobMock(j: Omit<Job, 'id' | 'createdAt'>): Job {
  return {
    ...j,
    id: ulid(),
    createdAt: new Date(),
  } as Job;
}
