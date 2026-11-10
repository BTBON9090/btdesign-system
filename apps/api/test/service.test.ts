import assert from 'node:assert/strict';
import test from 'node:test';
import { createAIService, validateTheme, type ApiInput } from '../src/service.js';

const theme = {
  name: '青山科技',
  primary: '#0F766E',
  radius: 8,
  density: 'comfortable' as const,
  font: 'system' as const,
};
const env = { DEEPSEEK_API_KEY: 'test-server-only-key' };
const request: ApiInput = {
  method: 'POST',
  path: '/api/generate',
  headers: { 'content-type': 'application/json' },
  body: { prompt: '为青山科技设计清晰、稳健的管理系统', currentTheme: theme },
  clientId: 'test-client',
};
const completion = (result: unknown, finishReason = 'stop') =>
  Response.json({
    choices: [{ finish_reason: finishReason, message: { content: JSON.stringify(result) } }],
  });
const validResponse = () =>
  completion({ theme, rationale: '深青色与适中的圆角适合稳定、清晰的企业工作台。' });
const fakeFetch: typeof fetch = async () => validResponse();

test('unconfigured service is honest and does not call the provider', async () => {
  let called = false;
  const service = createAIService({
    env: {},
    fetcher: async () => {
      called = true;
      return validResponse();
    },
  });
  assert.deepEqual(service.health().body, {
    configured: false,
    authRequired: false,
    provider: 'DeepSeek',
  });
  const result = await service.handle(request);
  assert.equal(result.status, 503);
  assert.equal(result.body.code, 'AI_NOT_CONFIGURED');
  assert.equal(called, false);
});

test('DeepSeek defaults, JSON mode, server key and safe output work together', async () => {
  let providerUrl = '';
  let upstreamOptions: RequestInit | undefined;
  const service = createAIService({
    env,
    fetcher: async (url, options) => {
      providerUrl = String(url);
      upstreamOptions = options;
      return validResponse();
    },
  });
  const result = await service.handle(request);
  assert.equal(providerUrl, 'https://api.deepseek.com/chat/completions');
  const payload = JSON.parse(String(upstreamOptions?.body));
  assert.equal(payload.model, 'deepseek-flash');
  assert.deepEqual(payload.response_format, { type: 'json_object' });
  assert.deepEqual(payload.thinking, { type: 'disabled' });
  assert.equal(
    new Headers(upstreamOptions?.headers).get('authorization'),
    'Bearer test-server-only-key',
  );
  assert.deepEqual(result, {
    status: 200,
    body: { theme, rationale: '深青色与适中的圆角适合稳定、清晰的企业工作台。', source: 'ai' },
  });
  assert.doesNotMatch(JSON.stringify(result), /test-server-only-key/);
  assert.doesNotMatch(JSON.stringify(service.health()), /test-server-only-key/);
});

test('production requires a separate Lab token and rejects incorrect credentials', async () => {
  const unprotected = createAIService({
    env: { ...env, NODE_ENV: 'production' },
    fetcher: fakeFetch,
  });
  assert.equal(unprotected.health().body.configured, false);
  assert.equal((await unprotected.handle(request)).status, 503);
  const protectedService = createAIService({
    env: { ...env, NODE_ENV: 'production', LAB_API_TOKEN: 'separate-lab-token' },
    fetcher: fakeFetch,
  });
  assert.equal((await protectedService.handle(request)).status, 401);
  const accepted = await protectedService.handle({
    ...request,
    headers: { ...request.headers, authorization: 'Bearer separate-lab-token' },
  });
  assert.equal(accepted.status, 200);
});

test('unsafe request shapes, malformed themes and oversized bodies never reach provider', async () => {
  let calls = 0;
  const service = createAIService({
    env,
    fetcher: async () => {
      calls++;
      return validResponse();
    },
  });
  for (const body of [
    null,
    [],
    { prompt: 'x' },
    { prompt: 'valid description', extra: true },
    { prompt: 'valid description', currentTheme: { ...theme, radius: 999 } },
    { prompt: 'valid description', currentTheme: { ...theme, primary: 'url(javascript:)' } },
  ]) {
    assert.equal((await service.handle({ ...request, body })).status, 400);
  }
  assert.equal(
    (await service.handle({ ...request, body: { prompt: '字'.repeat(20_000) } })).status,
    413,
  );
  assert.equal(calls, 0);
});

test('wrong methods, media types and cross-site browser requests are rejected', async () => {
  const service = createAIService({ env, fetcher: fakeFetch });
  assert.equal((await service.handle({ ...request, method: 'GET' })).status, 405);
  assert.equal((await service.handle({ ...request, headers: {} })).status, 415);
  assert.equal(
    (
      await service.handle({
        ...request,
        headers: { ...request.headers, 'sec-fetch-site': 'cross-site' },
      })
    ).status,
    403,
  );
  assert.equal((await service.handle({ ...request, path: '/missing' })).status, 404);
});

test('per-client rate limits recover after the window', async () => {
  let now = 1_000;
  const service = createAIService({ env, fetcher: fakeFetch, now: () => now, rateLimit: 2 });
  assert.equal((await service.handle(request)).status, 200);
  assert.equal((await service.handle(request)).status, 200);
  const limited = await service.handle(request);
  assert.equal(limited.status, 429);
  assert.equal(limited.headers?.['Retry-After'], '60');
  assert.equal((await service.handle({ ...request, clientId: 'second-client' })).status, 200);
  now += 60_001;
  assert.equal((await service.handle(request)).status, 200);
});

test('global budget also limits requests across clients', async () => {
  const service = createAIService({ env, fetcher: fakeFetch, globalRateLimit: 2 });
  assert.equal((await service.handle(request)).status, 200);
  assert.equal((await service.handle({ ...request, clientId: 'two' })).status, 200);
  assert.equal((await service.handle({ ...request, clientId: 'three' })).status, 429);
});

test('invalid or incomplete model output never becomes a theme', async () => {
  const outputs = [
    completion({ theme: { ...theme, css: 'body{display:none}' }, rationale: 'text' }),
    completion({ theme: { ...theme, radius: 3.5 }, rationale: 'text' }),
    completion({ theme, rationale: '' }),
    completion({ theme, rationale: 'text', arbitrary: true }),
    completion({ theme, rationale: 'text' }, 'length'),
    Response.json({ choices: [{ finish_reason: 'stop', message: { content: '   ' } }] }),
    Response.json({
      choices: [{ finish_reason: 'stop', message: { content: '```json\n{}\n```' } }],
    }),
  ];
  for (const response of outputs) {
    const service = createAIService({ env, fetcher: async () => response });
    const result = await service.handle(request);
    assert.equal(result.status, 502);
    assert.equal(result.body.code, 'INVALID_AI_RESPONSE');
    assert.equal(result.body.theme, undefined);
  }
});

test('provider error details and credentials do not leak into responses', async () => {
  for (const status of [400, 401, 403, 429, 500]) {
    const service = createAIService({
      env,
      fetcher: async () => Response.json({ error: 'sensitive-provider-details' }, { status }),
    });
    const result = await service.handle(request);
    assert.equal(result.status, status === 429 ? 503 : 502);
    assert.doesNotMatch(JSON.stringify(result), /sensitive-provider-details|test-server-only-key/);
  }
});

test('upstream timeout aborts the fetch and provides a recoverable error', async () => {
  let aborted = false;
  const service = createAIService({
    env,
    timeoutMs: 10,
    fetcher: async (_url, options) =>
      new Promise<Response>((_resolve, reject) => {
        options?.signal?.addEventListener('abort', () => {
          aborted = true;
          reject(new DOMException('Aborted', 'AbortError'));
        });
      }),
  });
  const result = await service.handle(request);
  assert.equal(aborted, true);
  assert.equal(result.status, 504);
  assert.equal(result.body.code, 'AI_TIMEOUT');
});

test('upstream response size is bounded', async () => {
  const service = createAIService({ env, fetcher: async () => new Response('x'.repeat(66_000)) });
  assert.equal((await service.handle(request)).status, 502);
});

test('compatible endpoints preserve their model and omit DeepSeek-only fields', async () => {
  let body: Record<string, unknown> = {};
  const service = createAIService({
    env: { AI_API_KEY: 'key', AI_BASE_URL: 'https://example.test/v1/', AI_MODEL: 'selected-model' },
    fetcher: async (url, options) => {
      assert.equal(String(url), 'https://example.test/v1/chat/completions');
      body = JSON.parse(String(options?.body));
      return validResponse();
    },
  });
  assert.equal((await service.handle(request)).status, 200);
  assert.equal(body.model, 'selected-model');
  assert.equal(body.thinking, undefined);
  const unsafe = createAIService({ env: { ...env, AI_BASE_URL: 'http://remote.test' } });
  assert.equal(unsafe.health().body.configured, false);
});

test('theme validator produces only supported primitive values', () => {
  assert.deepEqual(validateTheme({ ...theme, name: '  Name  ', primary: '#aabbcc' }), {
    ...theme,
    name: 'Name',
    primary: '#AABBCC',
  });
  assert.equal(validateTheme({ ...theme, font: 'url(https://example.test)' }), null);
  assert.equal(validateTheme({ ...theme, name: '<script>' }), null);
});
