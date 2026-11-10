import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleHttp } from '../apps/api/src/http.js';

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  await handleHttp(request, response, '/api/health', true);
}
