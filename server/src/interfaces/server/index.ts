import fastify from 'fastify';
import fastifyCors from 'fastify-cors';
import fp from 'fastify-plugin';
import { registerPlugins } from './plugins';
import { jobsRoutes } from './routes/jobs';

export const runServer = ({ port }: { port: number }) => {
  const app = fastify();
  // TODO: Set correct cors
  void app.register(fastifyCors, { origin: true });
  void app.register(fp(registerPlugins));
  void app.register(jobsRoutes);

  app.listen(port, '0.0.0.0', (err, address) => {
    if (err) throw err;
    app.log.info(`Server starts on: ${address}`);
  });
};
