const { spawn } = require('child_process');

process.env.NEXT_TELEMETRY_DISABLED = process.env.NEXT_TELEMETRY_DISABLED || '1';
process.env.NO_UPDATE_NOTIFIER = process.env.NO_UPDATE_NOTIFIER || '1';
process.env.npm_config_update_notifier = process.env.npm_config_update_notifier || 'false';

const nextBin = require.resolve('next/dist/bin/next');
const child = spawn(process.execPath, [nextBin, 'dev'], {
  stdio: 'inherit',
  env: process.env,
  shell: false,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
