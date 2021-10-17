import Bull from 'bull';
import { Job } from '~/entity/Job';
import { JobQueueRepositoryInterface } from '~/repository/JobQueue';

export class JobQueueRepository implements JobQueueRepositoryInterface {
  jobQueue: Bull.Queue<Job>;

  constructor({ redisConf }: { redisConf: { port: number; host: string } }) {
    const jobQueue = new Bull<Job>('jobQueue', {
      redis: redisConf,
    });
    // Constructor で、jobQueue の process を差し込む
    // jobQueue.process
    this.jobQueue = jobQueue;
  }

  async getQueues() {
    const [waitingJobs, activeJobs] = await Promise.all([this.jobQueue.getWaiting(), this.jobQueue.getActive()]);
    return [...waitingJobs.map(v => v.data), ...activeJobs.map(v => v.data)];
  }

  async registerJob(job: Job) {
    await this.jobQueue.add(job);
  }
}
