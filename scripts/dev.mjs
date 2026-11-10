import { spawn } from 'node:child_process';
const children = [
  spawn('npm', ['run', 'dev', '-w', '@btdesign/docs'], { stdio: 'inherit' }),
  spawn(
    process.execPath,
    ['--env-file-if-exists=.env', '--import', 'tsx', 'apps/api/src/server.ts'],
    { stdio: 'inherit' },
  ),
];
function close() {
  children.forEach((p) => p.kill('SIGTERM'));
}
process.on('SIGINT', close);
process.on('SIGTERM', close);
children.forEach((p) =>
  p.on('exit', (code) => {
    if (code) {
      close();
      process.exitCode = code;
    }
  }),
);
