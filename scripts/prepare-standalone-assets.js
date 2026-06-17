const { cpSync, existsSync, mkdirSync, rmSync } = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const standaloneRoot = path.join(root, '.next', 'standalone');
const standaloneNext = path.join(standaloneRoot, '.next');
const staticSource = path.join(root, '.next', 'static');
const staticTarget = path.join(standaloneNext, 'static');
const publicSource = path.join(root, 'public');
const publicTarget = path.join(standaloneRoot, 'public');

function copyFresh(source, target) {
  if (!existsSync(source)) return;
  rmSync(target, { recursive: true, force: true });
  mkdirSync(path.dirname(target), { recursive: true });
  cpSync(source, target, { recursive: true });
}

if (!existsSync(standaloneRoot)) {
  console.warn('Standalone output was not found. Skipping asset copy.');
  process.exit(0);
}

copyFresh(staticSource, staticTarget);
copyFresh(publicSource, publicTarget);

console.log('Standalone static assets prepared.');
