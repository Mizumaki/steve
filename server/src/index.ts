import fastify from 'fastify';
import { Job } from './entity/Job';

const port = process.env['PORT'] || 8080;

const app = fastify();

const jobs: Job[] = [];

/**
 * Job 一覧を取得
 */
app.get('/jobs', (_req, res) => {
  void res.status(200).send(jobs);
});

/**
 * Job の新規作成
 */
app.post('/jobs', (req, res) => {
  console.log('');
});

/**
 * Job の内容を更新する（status の更新を含む）
 */
app.patch('/jobs/:id', (req, res) => {
  console.log('');
});

/**
 * Job の status のみを更新する
 */
app.put('/jobs/:id/status', (req, res) => {
  console.log('');
});

app.listen(port, '0.0.0.0', (err, address) => {
  if (err) throw err;
  app.log.info(`Server starts on: ${address}`);
});
