import { createServer } from 'node:http';
import { handleHttp } from './http.js';

const port = Number(process.env.API_PORT || 8787);
const host = process.env.API_HOST || '127.0.0.1';
const server = createServer((request, response) => {
  void handleHttp(request, response);
});
server.requestTimeout = 40_000;
server.headersTimeout = 10_000;
server.listen(port, host, () => {
  console.log(`BTDESIGN AI API listening on http://${host}:${port}`);
});
