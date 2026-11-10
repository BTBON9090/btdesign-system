import assert from 'node:assert/strict';
import { createServer, request as httpRequest } from 'node:http';
import test from 'node:test';
import { handleHttp } from '../src/http.js';

test('HTTP adapter exposes health, rejects bad JSON, and bounds a chunked request', async (context) => {
  const server = createServer((request, response) => {
    void handleHttp(request, response);
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  context.after(
    () =>
      new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      ),
  );
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const base = `http://127.0.0.1:${address.port}`;
  const health = await fetch(`${base}/api/health`);
  assert.equal(health.status, 200);
  assert.equal(health.headers.get('cache-control'), 'no-store');
  assert.equal(typeof (await health.json()).configured, 'boolean');
  const invalid = await fetch(`${base}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{',
  });
  assert.equal(invalid.status, 400);
  assert.equal((await invalid.json()).code, 'INVALID_JSON');
  const oversized = await new Promise<{ status: number; body: string }>((resolve, reject) => {
    const request = httpRequest(
      `${base}/api/generate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked' },
      },
      (response) => {
        let body = '';
        response.on('data', (chunk) => {
          body += chunk.toString();
        });
        response.on('end', () => resolve({ status: response.statusCode!, body }));
      },
    );
    request.on('error', reject);
    request.write('x'.repeat(20_000));
    request.end();
  });
  assert.equal(oversized.status, 413);
  assert.equal(JSON.parse(oversized.body).code, 'PAYLOAD_TOO_LARGE');
});
