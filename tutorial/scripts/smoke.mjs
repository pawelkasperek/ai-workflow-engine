import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { readFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { readLessons, sourceFiles, tutorialRoot } from './content.mjs';

// Ask the OS for an available port instead of colliding with a user's dev server.
const probe = createServer();
probe.listen(0, '127.0.0.1');
await once(probe, 'listening');
const port = probe.address().port;
await new Promise((resolve) => probe.close(resolve));
const base = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ['.output/server/index.mjs'], {
  cwd: tutorialRoot,
  env: { ...process.env, PORT: String(port), HOST: '127.0.0.1', NODE_ENV: 'production' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let logs = '';
child.stdout.on('data', (chunk) => { logs += chunk; });
child.stderr.on('data', (chunk) => { logs += chunk; });
const exited = once(child, 'exit');

try {
  let ready = false;
  for (let attempt = 0; attempt < 150; attempt++) {
    if (child.exitCode !== null) throw new Error(`Serwer zakończył pracę:\n${logs}`);
    try {
      const response = await fetch(base, { signal: AbortSignal.timeout(1000) });
      if (response.ok) { ready = true; break; }
    } catch { /* The server may still be starting. */ }
    await delay(100);
  }
  assert.ok(ready, `Serwer nie wystartował:\n${logs}`);
  const home = await (await fetch(base)).text();
  assert.match(home, /lang="pl"/);
  assert.match(home, /Ty ustalasz proces/);
  assert.match(home, /Szukaj w poradniku/);

  const lessons = await readLessons();
  for (const { route, text } of lessons) {
    const response = await fetch(`${base}${route}`, { signal: AbortSignal.timeout(15000) });
    assert.equal(response.status, 200, route);
    const html = await response.text();
    assert.ok(html.includes(text.match(/^title: "(.+)"$/m)[1]), `Brak treści: ${route}`);
    assert.match(html, /Oczekiwany wynik/);
    assert.match(html, /Na tej stronie|Spis treści/);
  }
  for (const { relative, absolute } of await sourceFiles(lessons)) {
    const response = await fetch(`${base}/sources/${relative}`);
    assert.equal(response.status, 200, relative);
    assert.equal(await response.text(), await readFile(absolute, 'utf8'), relative);
  }
  const search = await fetch(`${base}/api/search?query=zatwierdzenie`);
  assert.equal(search.status, 200, 'wyszukiwanie po polsku');
  const results = await search.json();
  assert.ok(Array.isArray(results) && results.length > 0, 'Brak wyników wyszukiwania');
  assert.ok(results.some((result) => result.url?.startsWith('/docs')), 'Brak linku do lekcji');
  assert.equal((await fetch(`${base}/docs/nie-ma-takiej-lekcji`)).status, 404);
  console.log(`Smoke OK: strona startowa, ${lessons.length} lekcji, źródła, wyszukiwanie i 404.`);
} catch (error) {
  console.error(logs);
  throw error;
} finally {
  if (child.exitCode === null) {
    child.kill('SIGTERM');
    await Promise.race([exited, delay(5000)]);
    if (child.exitCode === null) {
      child.kill('SIGKILL');
      await exited;
    }
  }
}
