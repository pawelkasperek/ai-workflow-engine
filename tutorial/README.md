# Polski tutorial AI Workflow Engine

Samodzielny poradnik obsługi aplikacji: React, TanStack Start/Router,
Fumadocs UI i MDX, TypeScript oraz Tailwind CSS. Korzysta z oficjalnego
szablonu `create-fumadocs-app` (TanStack Start). Nie łączy się z API viewera,
nie uruchamia agentów i nie wymaga kluczy API.

## Uruchomienie

Wymagania: Node.js >=22.12, npm i opcjonalnie `just`.
Z głównego katalogu repozytorium:

```bash
just tutorial-install
just tutorial-dev
```

Otwórz **http://localhost:10780**. Tablica Go to osobna aplikacja, zwykle na 10770.
Serwer tutoriala nasłuchuje lokalnie. Alternatywa bez just:

```bash
npm --prefix tutorial ci
npm --prefix tutorial run dev
```

## Lokalne CI

```bash
just tutorial-ci
```

Kolejno: `npm ci`, testy struktury/odnośników/źródeł, build MDX + klienta +
serwera, TypeScript, smoke test produkcyjnego serwera. Smoke sprawdza 14 stron
dokumentacji, stronę startową, lokalne kopie źródeł, wyszukiwanie i 404;
wybiera wolny port i po sprawdzeniu zamyka własny proces.

W `tutorial/` dostępne są też `just check`, `just build`, `just typecheck`,
`just smoke` i `just preview`. Przy pierwszym typecheck najpierw wykonaj build,
który generuje plik tras TanStack. Build znajduje się w `.output/`;
`just preview` uruchamia jego lokalny podgląd. Produkcyjny serwer Node można
uruchomić przez `HOST=127.0.0.1 PORT=10780 node .output/server/index.mjs`.

## Treść

Lekcje są w `content/docs/*.mdx`, kolejność w `meta.json`.
Każda ma frontmatter `title` i `description` oraz sekcje: Cel, Krok po kroku,
Oczekiwany wynik i Źródła. Nazwy przycisków odzwierciedlają angielski UI.

Linki `/sources/...` wskazują lokalne kopie **wyłącznie plików wymienionych
w lekcjach**. Skrypt `scripts/content.mjs` weryfikuje i kopiuje te pliki z
repozytorium do ignorowanego `public/sources/` przed dev/build.
Nie kopiuje prywatnego `projects.yaml`, logów ani całego repozytorium.
Zewnętrzne linki nie są odpytywane przez CI; sprawdzane są linki do lekcji
i wskazanych plików repozytorium. Po zmianie źródeł ponów build lub dev.

Wyszukiwanie jest lokalne i korzysta z tokenizacji wielojęzycznej.
Silnik nie ma osobnego polskiego stemmera, więc nie zakładaj pełnej obsługi
odmiany słów; w razie potrzeby wyszukaj słowo w innej formie.

Tutorial uczy szablonu development i wyraźnie odróżnia go od workflow
samego silnika. Nie traktuj przykładów wyników testów jako dowodów
rzeczywistego wykonania pracy.
