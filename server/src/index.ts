import { runServer } from './interfaces/server';

const port = Number(process.env['PORT']) || 8080;

runServer({ port });
