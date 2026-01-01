#!/usr/bin/env node
/* Collect E2E artifacts into a single zip for CI uploads.
   - Gathers: e2e/logs, e2e/screenshots, playwright-report
   - Produces: artifacts/e2e-artifacts-<timestamp>.zip
   - Returns non-zero if zip failed.
*/
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

function ensureDir(p) {
  try { fs.mkdirSync(p, { recursive: true }); } catch (e) {}
}

const cwd = process.cwd();
const outDir = path.join(cwd, 'artifacts');
ensureDir(outDir);
const ts = Date.now();
const outPath = path.join(outDir, `e2e-artifacts-${ts}.zip`);

console.log('Collecting artifacts into', outPath);

// Create a temporary directory to stage the artifacts (so zip keeps structure)
const tmpDir = path.join(cwd, 'artifacts', `e2e-stage-${ts}`);
fs.mkdirSync(tmpDir, { recursive: true });

function copyIfExists(srcRel, destRel) {
  const src = path.join(cwd, srcRel);
  const dest = path.join(tmpDir, destRel);
  if (fs.existsSync(src)) {
    // ensure destination parent exists
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    // copy recursively
    if (process.platform === 'win32') {
      // Use PowerShell Copy-Item to avoid robocopy's non-zero exit codes for empty folders
      execSync(`powershell -NoLogo -NoProfile -Command "Copy-Item -Path '${src}\\*' -Destination '${dest}' -Recurse -Force -ErrorAction SilentlyContinue"`, { stdio: 'ignore' });
    } else {
      execSync(`cp -r "${src}" "${dest}"`, { stdio: 'ignore' });
    }
    console.log(`Staged ${srcRel} -> ${destRel}`);
    return true;
  } else {
    fs.writeFileSync(path.join(tmpDir, `${destRel}-MISSING.txt`), `NOTE: ${srcRel} missing`);
    console.warn(`${srcRel} missing; created placeholder`);
    return false;
  }
}

copyIfExists('e2e/logs', 'e2e/logs');
copyIfExists('e2e/screenshots', 'e2e/screenshots');
copyIfExists('playwright-report', 'playwright-report');

// Create zip using platform tools (PowerShell/Compress-Archive on Windows, zip on Unix)
try {
  if (os.platform() === 'win32') {
    const zipCmd = `powershell -NoLogo -NoProfile -Command "Compress-Archive -Path '${tmpDir}\\*' -DestinationPath '${outPath}' -Force"`;
    execSync(zipCmd, { stdio: 'inherit' });
  } else {
    const zipCmd = `cd '${path.join(cwd, 'artifacts')}' && zip -r '${path.basename(outPath)}' '${path.basename(tmpDir)}'`;
    execSync(zipCmd, { stdio: 'inherit', shell: true });
  }
  console.log(`Collected E2E artifacts into ${outPath}`);
} catch (e) {
  console.error('Failed to create zip using system tool. Ensure zip (or PowerShell) is installed.', e);
  process.exit(1);
}

// cleanup staged dir (optional)
try {
  if (process.platform === 'win32') {
    execSync(`powershell -NoLogo -NoProfile -Command "Remove-Item -LiteralPath '${tmpDir}' -Recurse -Force -ErrorAction SilentlyContinue"`, { stdio: 'ignore' });
  } else {
    execSync(`rm -rf '${tmpDir}'`);
  }
} catch (e) { /* ignore cleanup errors */ }

process.exit(0);

