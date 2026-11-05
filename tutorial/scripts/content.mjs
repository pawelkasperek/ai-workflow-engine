import { copyFile, mkdir, readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const tutorialRoot = fileURLToPath(new URL('../', import.meta.url));
export const repoRoot = path.resolve(tutorialRoot, '..');
export const contentRoot = path.join(tutorialRoot, 'content/docs');

export async function readLessons() {
  const files = (await readdir(contentRoot)).filter((file) => file.endsWith('.mdx')).sort();
  return Promise.all(files.map(async (file) => ({
    file,
    route: file === 'index.mdx' ? '/docs' : `/docs/${file.slice(0, -4)}`,
    text: await readFile(path.join(contentRoot, file), 'utf8'),
  })));
}

export function markdownLinks(text) {
  // Ignore command examples and literal inline code, which are not navigation.
  const prose = text.replace(/^```[^\n]*\n[\s\S]*?^```/gm, '').replace(/`[^`\n]+`/g, '');
  return [...prose.matchAll(/!?\[[^\]]*\]\(([^)\s]+)\)/g)].map((match) => match[1]);
}

export function sourcePath(href) {
  const relative = decodeURIComponent(href.slice('/sources/'.length).split('#')[0]);
  const absolute = path.resolve(repoRoot, relative);
  if (!absolute.startsWith(`${repoRoot}${path.sep}`) || relative.startsWith('tutorial/')) {
    throw new Error(`Niedozwolona ścieżka źródła: ${href}`);
  }
  return { relative, absolute };
}

export async function sourceFiles(lessons) {
  lessons ??= await readLessons();
  const sources = new Set(lessons.flatMap(({ text }) => markdownLinks(text))
    .filter((href) => href.startsWith('/sources/')));
  return [...sources].sort().map(sourcePath);
}

export async function validateLessons(lessons) {
  lessons ??= await readLessons();
  const errors = [];
  const routes = new Set(lessons.map(({ route }) => route));
  for (const { file, text } of lessons) {
    if (!/^---\ntitle: ".+"\ndescription: ".+"\n---\n/.test(text)) {
      errors.push(`${file}: brak tytułu lub opisu w frontmatter`);
    }
    for (const heading of ['Cel', 'Krok po kroku', 'Oczekiwany wynik', 'Źródła']) {
      if (!text.includes(`## ${heading}\n`)) errors.push(`${file}: brak sekcji ${heading}`);
    }
    if (!markdownLinks(text).some((href) => href.startsWith('/sources/'))) {
      errors.push(`${file}: brak odnośnika do źródeł`);
    }
    for (const href of markdownLinks(text)) {
      if (href.startsWith('/docs')) {
        const route = href.split(/[?#]/)[0].replace(/\/$/, '');
        if (!routes.has(route)) errors.push(`${file}: nieistniejąca lekcja ${href}`);
      } else if (href.startsWith('/sources/')) {
        try {
          const { absolute } = sourcePath(href);
          if (!(await stat(absolute)).isFile()) throw new Error('to nie jest plik');
        } catch (error) {
          errors.push(`${file}: nieprawidłowe źródło ${href} (${error.message})`);
        }
      } else if (!/^(https?:|mailto:|#)/.test(href)) {
        errors.push(`${file}: nieobsługiwany lokalny odnośnik ${href}`);
      }
    }
  }
  const meta = JSON.parse(await readFile(path.join(contentRoot, 'meta.json'), 'utf8'));
  const pages = meta.pages.filter((page) => !page.startsWith('---'));
  const files = lessons.map(({ file }) => file.slice(0, -4));
  if (new Set(pages).size !== pages.length) errors.push('meta.json: powtórzona lekcja');
  for (const file of files) if (!pages.includes(file)) errors.push(`meta.json: brak ${file}`);
  for (const page of pages) if (!files.includes(page)) errors.push(`meta.json: nie ma pliku ${page}`);
  return errors;
}

async function syncSources() {
  const lessons = await readLessons();
  const errors = await validateLessons(lessons);
  if (errors.length) throw new Error(errors.join('\n'));
  const files = await sourceFiles(lessons);
  for (const { relative, absolute } of files) {
    const target = path.join(tutorialRoot, 'public/sources', relative);
    await mkdir(path.dirname(target), { recursive: true });
    await copyFile(absolute, target);
  }
  console.log(`Źródła: ${files.length} plików; lekcje: ${lessons.length}.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv[2] !== 'sync') throw new Error('Użycie: node scripts/content.mjs sync');
  await syncSources();
}
