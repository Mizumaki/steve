import fastify from 'fastify';
import fastifyCors from 'fastify-cors';
import { Job, JobStatus, JobType } from './entity/Job';
import { genJobMock, mock } from './mock';
import { assertNever } from './utils/assertNever';

const port = process.env['PORT'] || 8080;

const app = fastify();
// TODO: Set correct cors
void app.register(fastifyCors, { origin: true });

// TODO: Replace by permanent store (like Redis)
const jobs: Job[] = mock();

const processQueue: Set<Job> = new Set();

/**
 * Job 一覧を取得
 */
app.get('/jobs', (_req, res) => {
  void res.status(200).send(jobs);
});

/**
 * Job の新規作成
 */
app.post<{ Body: Omit<Job, 'id' | 'createdAt' | 'status'> }>('/jobs', (req, res) => {
  // TODO: Check body format
  const jobData = req.body;
  const job = genJobMock({ ...jobData, status: 'before-start' });
  jobs.push(job);
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
app.post<{ Params: { id: string } }>('/jobs/:id/start', (req, res) => {
  const jobId = req.params.id;
  const jobIndex = jobs.findIndex(v => v.id === jobId);
  if (jobIndex === -1) {
    void res
      .status(404)
      .send({ error: { reason: 'job.not-found', message: `The job with id: '${jobId}' not found.` } });
    return;
  }
  const job = jobs[jobIndex] as Job;

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
  processQueue.add(job);
  void res.send();
});

/**
 * Job の stop
 */
app.post('/jobs/:id/stop', (_req, res) => {
  void res.send();
});

app.listen(port, '0.0.0.0', (err, address) => {
  if (err) throw err;
  app.log.info(`Server starts on: ${address}`);
});
