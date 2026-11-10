import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleHttp } from '../apps/api/src/http.js';

export const config = { maxDuration: 40 };

export default async function handler(
  request: IncomingMessage & { body?: unknown },
  response: ServerResponse,
) {
  await handleHttp(request, response, '/api/generate', true);
}
