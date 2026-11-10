import { createAIService, MAX_BODY_BYTES, type ApiResponse } from './service.js';

/** Only platform-supplied context is trusted; forwarded headers never identify clients. */
export interface WebContext {
  request: Request;
  env?: Record<string, unknown>;
  clientIp?: string;
}

type ServiceOptions = NonNullable<Parameters<typeof createAIService>[0]>;
type Environment = Record<string, string | undefined>;
const ENV_KEYS = [
  'DEEPSEEK_API_KEY',
  'AI_API_KEY',
  'AI_BASE_URL',
  'AI_MODEL',
  'LAB_API_TOKEN',
] as const;

function jsonResponse(result: ApiResponse): Response {
  return new Response(JSON.stringify(result.body), {
    status: result.status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...result.headers,
    },
  });
}

async function readBody(request: Request): Promise<unknown> {
  const declared = Number(request.headers.get('content-length') || 0);
  if (declared > MAX_BODY_BYTES) {
    await request.body?.cancel().catch(() => undefined);
    throw new Error('too-large');
  }
  if (!request.body) return null;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) throw new Error('too-large');
      chunks.push(value);
    }
  } catch (cause) {
    await reader.cancel().catch(() => undefined);
    throw cause;
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes) || 'null');
}

/**
 * A handler retains one service and its rate-limit buckets for the runtime lifetime.
 * Updating platform configuration does not recreate the service or reset its budget.
 * These instance-local limits supplement, rather than replace, platform-wide limits.
 */
export function createWebHandler(options: ServiceOptions = {}) {
  const runtimeEnvironment = options.env ?? process.env;
  const serviceEnvironment: Environment = { NODE_ENV: 'production' };
  const service = createAIService({ ...options, env: serviceEnvironment });

  return async function handle(context: WebContext, path?: string): Promise<Response> {
    try {
      const { request } = context;
      const pathname = path || new URL(request.url).pathname;
      const headers: Record<string, string> = {};
      request.headers.forEach((value, name) => {
        headers[name] = value;
      });
      let body: unknown;
      // Let the shared service reject methods, media types and cross-site requests
      // without parsing an irrelevant or potentially unbounded body first.
      const needsBody =
        request.method === 'POST' &&
        ['/api/generate', '/api/compose'].includes(pathname) &&
        /^application\/json(?:;|$)/i.test(headers['content-type'] || '') &&
        headers['sec-fetch-site'] !== 'cross-site';
      if (needsBody) {
        try {
          body = await readBody(request);
        } catch (cause) {
          const tooLarge = cause instanceof Error && cause.message === 'too-large';
          return jsonResponse({
            status: tooLarge ? 413 : 400,
            body: {
              code: tooLarge ? 'PAYLOAD_TOO_LARGE' : 'INVALID_JSON',
              error: tooLarge ? '请求内容过长，请精简后重试。' : '请求不是有效的 JSON。',
            },
          });
        }
      }
      // Context may be a new object for every invocation. Keep one mutable, whitelisted
      // environment object so configuration changes cannot accidentally clear the limiter.
      for (const key of ENV_KEYS) {
        const platformValue = context.env?.[key];
        serviceEnvironment[key] =
          typeof platformValue === 'string' ? platformValue : runtimeEnvironment[key];
      }
      serviceEnvironment.NODE_ENV = 'production';
      return jsonResponse(
        await service.handle({
          method: request.method,
          path: pathname,
          headers,
          body,
          clientId:
            typeof context.clientIp === 'string' && context.clientIp.trim()
              ? context.clientIp.trim()
              : 'edgeone-runtime',
        }),
      );
    } catch {
      return jsonResponse({
        status: 500,
        body: { code: 'INTERNAL_ERROR', error: '服务暂时不可用，请稍后重试。' },
      });
    }
  };
}

export const handleWeb = createWebHandler();
