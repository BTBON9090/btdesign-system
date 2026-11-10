import { handleWeb, type WebContext } from '../../apps/api/src/web.js';

export function onRequest(context: WebContext): Promise<Response> {
  return handleWeb(context, '/api/generate');
}
