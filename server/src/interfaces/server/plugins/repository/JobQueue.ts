import Bull from 'bull';
// Queue の処理ロジックはどこに書くべきか. Repository ではないな...
// Repository はあくまで、Queue の状態を参照するだけ（constructor で受け取る）にして、Queueシステムのロジックは別出しにする
// いや、それともロジック自体はここの配下に作るべき？ 別にすると repository が無駄に増えるだけかも

// jobQueue.process は差し込む側で定義する。その queue を constructor で流し込んで貰えば良い
import { Job } from '~/entity/Job';
import { JobQueueRepositoryInterface } from '~/repository/JobQueue';

export class JobQueueRepository implements JobQueueRepositoryInterface {
  jobQueue: Bull.Queue<Job>;

  constructor(jobQueue: Bull.Queue<Job>) {
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
