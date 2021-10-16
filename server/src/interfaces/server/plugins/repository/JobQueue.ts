import { Job } from '~/entity/Job';
import { JobQueueRepositoryInterface } from '~/repository/JobQueue';

export class JobQueueRepository implements JobQueueRepositoryInterface {
  async getQueues() {
    return Promise.resolve([]);
  }

  async registerJob(_job: Job) {
    return Promise.resolve();
  }
}
