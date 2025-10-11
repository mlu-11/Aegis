import { spawn } from 'node:child_process';

const children = [];

function spawnProc(cmd, args, opts = {}) {
  const child = spawn(cmd, args, { stdio: 'inherit', shell: false, ...opts });
  children.push(child);
  child.on('exit', (code, signal) => {
    // When one exits, shut down all
    shutdown(code ?? 0);
  });
  return child;
}

function shutdown(code = 0) {
  for (const child of children) {
    try { child.kill('SIGTERM'); } catch {}
  }
  // Give children a moment to exit gracefully
  setTimeout(() => process.exit(code), 200);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

// Start API and Web
spawnProc('npm', ['--prefix', 'server', 'run', 'dev']);
spawnProc('npm', ['run', 'dev']);
