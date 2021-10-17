import fastify from 'fastify';
import fastifyCors from 'fastify-cors';
import fp from 'fastify-plugin';
import { decorateFastifyInstance } from '~/utils/fastify/decorateFastifyInstance';
import { registerPlugins } from './plugins';
import { jobsRoutes } from './routes/jobs';

export const runServer = ({ port, redisPort }: { port: number; redisPort: number }) => {
  const app = fastify();
  // TODO: Set correct cors
  void app.register(fastifyCors, { origin: true });
  decorateFastifyInstance('redisPort', redisPort, app);
  void app.register(fp(registerPlugins));
  void app.register(jobsRoutes);

  app.listen(port, '0.0.0.0', (err, address) => {
    if (err) throw err;
    app.log.info(`Server starts on: ${address}`);
  });
};
