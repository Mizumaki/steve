import fastify from 'fastify';
import { helloWorld } from '~/helloWorld/hell';

const port = process.env['PORT'] || 8080;

const app = fastify();

app.get('/hello/world', (_req, res) => {
  helloWorld();
  void res.status(200).send();
});

app.listen(port, '0.0.0.0', (err, address) => {
  if (err) throw err;
  app.log.info(`Server starts on: ${address}`);
});
