import type { IncomingMessage, ServerResponse } from 'node:http';
import { createAIService, MAX_BODY_BYTES, type ApiResponse } from './service.js';

export const service = createAIService();
type BodyRequest = IncomingMessage & { body?: unknown };

function send(response: ServerResponse, result: ApiResponse) {
  response.writeHead(result.status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...result.headers,
  });
  response.end(JSON.stringify(result.body));
}

async function readBody(request: BodyRequest): Promise<unknown> {
  const declared = Number(request.headers['content-length'] || 0);
  if (declared > MAX_BODY_BYTES) throw new Error('too-large');
  // Vercel's Node adapter may already have parsed the JSON body.
  if (request.body !== undefined) {
    const text = typeof request.body === 'string' ? request.body : JSON.stringify(request.body);
    if (Buffer.byteLength(text) > MAX_BODY_BYTES) throw new Error('too-large');
    return typeof request.body === 'string' ? JSON.parse(text) : request.body;
  }
  return new Promise((resolve, reject) => {
    let size = 0;
    let exceeded = false;
    const chunks: Buffer[] = [];
    request.on('data', (chunk: Buffer | string) => {
      if (exceeded) return;
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      size += buffer.length;
      if (size > MAX_BODY_BYTES) {
        exceeded = true;
        chunks.length = 0;
        // Keep draining the request so the 413 response can reach the client.
        reject(new Error('too-large'));
        return;
      }
      chunks.push(buffer);
    });
    request.on('end', () => {
      if (exceeded) return;
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || 'null'));
      } catch (cause) {
        reject(cause);
      }
    });
    request.on('error', reject);
    request.on('aborted', () => reject(new Error('request-aborted')));
  });
}

export async function handleHttp(
  request: BodyRequest,
  response: ServerResponse,
  path?: string,
  trustedPlatform = false,
) {
  const pathname = path || new URL(request.url || '/', 'http://localhost').pathname;
  const headers: Record<string, string | undefined> = {};
  for (const [name, value] of Object.entries(request.headers))
    headers[name] = Array.isArray(value) ? value[0] : value;
  let body: unknown;
  if (request.method === 'POST' && ['/api/generate', '/api/compose'].includes(pathname)) {
    try {
      body = await readBody(request);
    } catch (cause) {
      const tooLarge = cause instanceof Error && cause.message === 'too-large';
      send(response, {
        status: tooLarge ? 413 : 400,
        body: {
          code: tooLarge ? 'PAYLOAD_TOO_LARGE' : 'INVALID_JSON',
          error: tooLarge ? '请求内容过长，请精简后重试。' : '请求不是有效的 JSON。',
        },
      });
      return;
    }
  }
  // Forwarded IPs are accepted only by the explicit Vercel adapter, never the local Node server.
  const clientId = trustedPlatform
    ? headers['x-real-ip'] || 'platform'
    : request.socket.remoteAddress || 'local';
  try {
    send(
      response,
      await service.handle({
        method: request.method || 'GET',
        path: pathname,
        headers,
        body,
        clientId,
      }),
    );
  } catch {
    send(response, {
      status: 500,
      body: { code: 'INTERNAL_ERROR', error: '服务暂时不可用，请稍后重试。' },
    });
  }
}
