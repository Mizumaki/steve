import fastify from 'fastify';
import fastifyCors from 'fastify-cors';
import type { Job } from './entity/Job';
import { mock } from './mock';

const port = process.env['PORT'] || 8080;

const app = fastify();
// TODO: Set correct cors
void app.register(fastifyCors, { origin: true });

// TODO: Replace by permanent store (like Redis)
const jobs: Job[] = mock();

/**
 * Job 一覧を取得
 */
app.get('/jobs', (_req, res) => {
  void res.status(200).send(jobs);
});

/**
 * Job の新規作成
 */
app.post('/jobs', (_req, res) => {
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
app.post('/jobs/:id/start', (_req, res) => {
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
