import Bull from 'bull';
import { Job } from '~/entity/Job';
import { JobQueueRepositoryInterface } from '~/repository/JobQueue';

export class JobQueueRepository implements JobQueueRepositoryInterface {
  private jobQueue: Bull.Queue<Job>;

  constructor({
    jobHandleLogic,
    redisConf,
  }: {
    // TODO: I'm not sure what is the best way to inject this logic into Repository based on Clean Architecture... :thinking:
    jobHandleLogic: (job: Job) => Promise<void>;
    redisConf: { port: number; host: string };
  }) {
    const jobQueue = new Bull<Job>('jobQueue', {
      redis: redisConf,
    });
    void jobQueue.process(async (queue, done) => {
      const job = queue.data;
      try {
        await jobHandleLogic(job);
        done();
      } catch (e) {
        // TODO(PR): pause の時の動きは、他の active job を止めるのか止めないのか、よく考える必要あり
        await jobQueue.pause();
        done();
      }
    });
    this.jobQueue = jobQueue;
  }

  async getQueues() {
    const [waitingJobs, activeJobs] = await Promise.all([this.jobQueue.getWaiting(), this.jobQueue.getActive()]);
    return [...waitingJobs.map(v => v.data), ...activeJobs.map(v => v.data)];
  }

  async registerJob(job: Job, options?: { prioritize?: boolean }) {
    const isPrioritize = options?.prioritize ?? false;
    if (isPrioritize) {
      await this.jobQueue.add(job, { priority: 1 });
    } else {
      await this.jobQueue.add(job);
    }
  }
}
