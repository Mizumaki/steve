import { FastifyPluginCallback } from 'fastify';
import { Job, JobStatus, JobType } from '~/entity/Job';
import { assertNever } from '~/utils/assertNever';

export const jobsRoutes: FastifyPluginCallback = (app, _options, next) => {
  /**
   * Job 一覧を取得
   */
  app.get('/jobs', async (_req, res) => {
    const jobs = await app.jobHistoryRepository.getJobs();
    void res.status(200).send(jobs);
  });

  /**
   * Job の新規作成
   */
  app.post<{ Body: Omit<Job, 'id' | 'createdAt' | 'status'> }>('/jobs', async (req, res) => {
    // TODO: Check body format
    const jobData = req.body;
    await app.jobHistoryRepository.addJob(jobData);
    void res.send();
  });

  /**
   * Job の内容を更新する（status の更新を含む）
   */
  app.patch('/jobs/:id', (_req, res) => {
    void res.send();
  });

  /**
   * Job の start
   */
  app.post<{ Params: { id: string } }>('/jobs/:id/start', async (req, res) => {
    const jobId = req.params.id;
    const job = await app.jobHistoryRepository.getJob(jobId);

    const changeStatusToWaiting = (j: Job) => {
      j.status = JobStatus.waiting;
      switch (j.type) {
        case JobType.single:
          break;
        case JobType.chain:
          Object.values(j.chainJobs).forEach(v => {
            changeStatusToWaiting(v);
          });
          break;
        case JobType.cluster:
          j.jobCluster.forEach(v => {
            changeStatusToWaiting(v);
          });
          break;
        default:
          assertNever(j);
      }
    };
    changeStatusToWaiting(job);

    await app.jobHistoryRepository.updateJob(jobId, job);
    await app.jobQueueRepository.registerJob(job);
    void res.send();
  });

  /**
   * Job の stop
   */
  app.post('/jobs/:id/stop', (_req, res) => {
    void res.send();
  });

  next();
};
