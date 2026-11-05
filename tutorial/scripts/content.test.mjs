import assert from 'node:assert/strict';
import { test } from 'node:test';
import { markdownLinks, readLessons, sourcePath, validateLessons } from './content.mjs';

test('wszystkie lekcje mają strukturę, działające lokalne linki i źródła', async () => {
  const lessons = await readLessons();
  assert.equal(lessons.length, 14, 'Wstęp i 13 lekcji');
  assert.deepEqual(await validateLessons(lessons), []);
});

test('przykłady poleceń nie są traktowane jako linki', () => {
  assert.deepEqual(markdownLinks(
    '[Lekcja](/docs/01-demo)\n```markdown\n[x](/nie-link)\n```\n`[kod](/tez-nie)`',
  ), ['/docs/01-demo']);
});

test('źródła nie mogą wychodzić poza repozytorium ani kopiować tutoriala', () => {
  assert.throws(() => sourcePath('/sources/../../etc/passwd'), /Niedozwolona/);
  assert.throws(() => sourcePath('/sources/tutorial/package.json'), /Niedozwolona/);
});

test('walidator odrzuca uszkodzony link i niekompletną lekcję', async () => {
  const errors = await validateLessons([{
    file: 'index.mdx',
    route: '/docs',
    text: '[Brak](/docs/nie-ma-takiej-lekcji)',
  }]);
  assert.ok(errors.some((error) => error.includes('nieistniejąca lekcja')));
  assert.ok(errors.some((error) => error.includes('brak sekcji')));
});
