import assert from 'node:assert/strict';
import test from 'node:test';
import { createWebHandler } from '../src/web.js';
import { MAX_BODY_BYTES } from '../src/service.js';
import { onRequest as healthRoute } from '../../../cloud-functions/api/health.js';
import { onRequest as generateRoute } from '../../../cloud-functions/api/generate.js';
import { onRequest as composeRoute } from '../../../cloud-functions/api/compose.js';

const env = {
  DEEPSEEK_API_KEY: 'test-provider-only-key',
  LAB_API_TOKEN: 'test-lab-access',
  NODE_ENV: 'development',
};
const theme = {
  name: '团队空间',
  primary: '#526B43',
  radius: 8,
  density: 'comfortable',
  font: 'system',
};
const composition = {
  name: '团队空间',
  scene: 'workspace',
  content: { title: '让团队保持同步', description: '一起管理工作空间。', actionLabel: '邀请成员' },
  theme,
  rationale: '使用团队工作台承载成员管理，绿色保持清晰的品牌识别。',
};
const completion = () =>
  Response.json({
    choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(composition) } }],
  });
function post(path = '/api/compose', overrides: RequestInit = {}) {
  return new Request(`https://design.btbon.cn${path}`, {
    method: 'POST',
    body: JSON.stringify({ prompt: '为团队创建一个清晰的协作工作台' }),
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-lab-access' },
    ...overrides,
  });
}

test('EdgeOne adapter forces production credentials and exposes only safe health metadata', async () => {
  const handle = createWebHandler({ env: {} });
  const request = () => new Request('https://design.btbon.cn/api/health');
  const missing = await handle({
    request: request(),
    env: { NODE_ENV: 'development', DEEPSEEK_API_KEY: env.DEEPSEEK_API_KEY },
  });
  assert.deepEqual(await missing.json(), {
    configured: false,
    authRequired: true,
    provider: 'DeepSeek',
  });
  const ready = await handle({ request: request(), env });
  assert.equal(ready.status, 200);
  assert.equal(ready.headers.get('content-type'), 'application/json; charset=utf-8');
  assert.equal(ready.headers.get('cache-control'), 'no-store');
  assert.equal(ready.headers.get('x-content-type-options'), 'nosniff');
  assert.deepEqual(await ready.json(), {
    configured: true,
    authRequired: true,
    provider: 'DeepSeek',
  });
  // Missing configuration in the next invocation cannot retain a previous context's secret.
  const cleared = await handle({ request: request(), env: {} });
  assert.equal((await cleared.json()).configured, false);
});

test('web methods, unknown paths, media types and cross-site requests use shared service errors', async () => {
  let calls = 0;
  const handle = createWebHandler({
    env,
    fetcher: async () => {
      calls++;
      return completion();
    },
  });
  const cases = [
    [new Request('https://design.btbon.cn/api/compose'), 405, 'METHOD_NOT_ALLOWED'],
    [
      new Request('https://design.btbon.cn/api/health', { method: 'POST' }),
      405,
      'METHOD_NOT_ALLOWED',
    ],
    [new Request('https://design.btbon.cn/missing'), 404, 'NOT_FOUND'],
    [
      post('/api/compose', { headers: { 'Content-Type': 'text/plain' }, body: 'not JSON' }),
      415,
      'UNSUPPORTED_MEDIA_TYPE',
    ],
    [
      post('/api/compose', {
        headers: { 'Content-Type': 'application/json', 'Sec-Fetch-Site': 'cross-site' },
        body: '{',
      }),
      403,
      'CROSS_SITE_REQUEST',
    ],
  ] as const;
  for (const [request, status, code] of cases) {
    const response = await handle({ request });
    assert.equal(response.status, status);
    assert.equal((await response.json()).code, code);
    if (status === 405) assert.ok(response.headers.get('allow'));
  }
  assert.equal(calls, 0);
});

test('web invalid JSON and missing or incorrect Lab credentials never reach the provider', async () => {
  let calls = 0;
  const handle = createWebHandler({
    env,
    fetcher: async () => {
      calls++;
      return completion();
    },
  });
  for (const path of ['/api/generate', '/api/compose']) {
    const invalid = await handle({ request: post(path, { body: '{' }) });
    assert.equal(invalid.status, 400);
    assert.equal((await invalid.json()).code, 'INVALID_JSON');
    const unauthenticated = await handle({
      request: post(path, { headers: { 'Content-Type': 'application/json' } }),
    });
    assert.equal(unauthenticated.status, 401);
    const wrong = await handle({
      request: post(path, {
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer wrong' },
      }),
    });
    assert.equal(wrong.status, 401);
    assert.doesNotMatch(await wrong.text(), /test-provider-only-key|test-lab-access/);
  }
  const unprotected = createWebHandler({
    env: { DEEPSEEK_API_KEY: env.DEEPSEEK_API_KEY, NODE_ENV: 'development' },
  });
  const disabled = await unprotected({ request: post() });
  assert.equal(disabled.status, 503);
  assert.equal((await disabled.json()).code, 'AI_NOT_CONFIGURED');
  assert.equal(calls, 0);
});

test('web adapter bounds declared and chunked body bytes before JSON parsing', async () => {
  const handle = createWebHandler({ env });
  const declared = await handle({
    request: post('/api/compose', {
      headers: { 'Content-Type': 'application/json', 'Content-Length': String(MAX_BODY_BYTES + 1) },
      body: '{}',
    }),
  });
  assert.equal(declared.status, 413);
  let cancelled = false;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('{"prompt":"'));
      controller.enqueue(new TextEncoder().encode('界'.repeat(6000)));
    },
    cancel() {
      cancelled = true;
    },
  });
  const request = post('/api/compose', { body: stream, duplex: 'half' } as RequestInit & {
    duplex: 'half';
  });
  assert.equal(request.headers.get('content-length'), null);
  const streamed = await handle({ request });
  assert.equal(streamed.status, 413);
  assert.equal((await streamed.json()).code, 'PAYLOAD_TOO_LARGE');
  assert.equal(cancelled, true);
});

test('web composition passes server configuration upstream and returns validated scene data', async () => {
  let providerKey = '';
  let requestBody: Record<string, unknown> = {};
  const handle = createWebHandler({
    env: {},
    fetcher: async (_url, options) => {
      providerKey = new Headers(options?.headers).get('authorization') || '';
      requestBody = JSON.parse(String(options?.body));
      return completion();
    },
  });
  const response = await handle({ request: post(), env, clientIp: '192.0.2.1' });
  assert.equal(response.status, 200);
  assert.equal(providerKey, `Bearer ${env.DEEPSEEK_API_KEY}`);
  assert.equal(requestBody.model, 'deepseek-flash');
  assert.deepEqual(await response.json(), { ...composition, source: 'ai' });
});

test('web runtime retains limits across fresh contexts and trusts only platform clientIp', async () => {
  let calls = 0;
  const handle = createWebHandler({
    env: {},
    rateLimit: 1,
    globalRateLimit: 10,
    now: () => 1000,
    fetcher: async () => {
      calls++;
      return completion();
    },
  });
  const request = (fakeIp: string) =>
    post('/api/compose', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-lab-access',
        'X-Forwarded-For': fakeIp,
        'X-Real-IP': fakeIp,
      },
    });
  assert.equal(
    (await handle({ request: request('203.0.113.1'), env: { ...env }, clientIp: '192.0.2.1' }))
      .status,
    200,
  );
  const limited = await handle({
    request: request('203.0.113.2'),
    env: { ...env },
    clientIp: '192.0.2.1',
  });
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get('retry-after'), '60');
  assert.equal(
    (await handle({ request: request('203.0.113.1'), env: { ...env }, clientIp: '192.0.2.2' }))
      .status,
    200,
  );
  assert.equal((await handle({ request: request('203.0.113.3'), env: { ...env } })).status, 200);
  assert.equal((await handle({ request: request('203.0.113.4'), env: { ...env } })).status, 429);
  assert.equal(calls, 3);
});

test('EdgeOne route files expose native Response handlers for all three endpoints', async () => {
  const health = await healthRoute({
    request: new Request('https://design.btbon.cn/ignored'),
    env,
  });
  assert.equal(health.status, 200);
  assert.equal((await health.json()).configured, true);
  for (const route of [generateRoute, composeRoute]) {
    const result = await route({ request: new Request('https://design.btbon.cn/ignored'), env });
    assert.equal(result.status, 405);
    assert.equal((await result.json()).code, 'METHOD_NOT_ALLOWED');
  }
});
