import { createFileRoute, Link } from '@tanstack/react-router';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import { ArrowRight, BookOpen, CheckCheck, FolderGit2, Terminal } from 'lucide-react';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <main className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24">
        <div className="hero-grid grid items-center gap-12 md:grid-cols-[1.2fr_1fr]">
          <section>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-fd-primary">
              Praktyczny przewodnik · po polsku
            </p>
            <h1 className="max-w-3xl text-4xl leading-tight font-semibold tracking-tight md:text-6xl">
              Ty ustalasz proces.<br />
              Agent robi kolejny krok.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-fd-muted-foreground">
              Naucz się obsługi AI Workflow Engine: od pierwszego zadania na tablicy
              do pracy z Claude lub Codex, świadomych zatwierdzeń i sprawdzonego wydania.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/docs/$" params={{ _splat: '' }} className="tutorial-button">
                Zacznij od początku <ArrowRight size={17} aria-hidden />
              </Link>
              <Link to="/docs/$" params={{ _splat: '01-demo' }} className="tutorial-button secondary">
                Najpierw zobacz demo
              </Link>
            </div>
            <p className="mt-5 text-sm text-fd-muted-foreground">
              Czytanie nie wymaga konta ani kluczy API. Ćwiczenia wykonujesz lokalnie.
            </p>
          </section>
          <aside className="rounded-2xl border bg-fd-card p-7 shadow-sm" aria-label="Jak działa aplikacja">
            <div className="mb-7 flex items-center gap-3 text-sm font-medium">
              <FolderGit2 className="text-fd-primary" size={20} aria-hidden />
              Jeden projekt. Przejrzysty ślad pracy.
            </div>
            {[
              ['01', 'Zadanie w Markdown', 'Opisujesz problem i oczekiwany wynik.'],
              ['02', 'Proces w workflow.yaml', 'Kolejny etap ma konkretne wymagania.'],
              ['03', 'Agent + Twoje zatwierdzenie', 'Sprawdzasz dowody, zanim praca pójdzie dalej.'],
              ['04', 'Testy i historia zmian', 'Wracasz do decyzji, wyników i czasu pracy.'],
            ].map(([number, title, text]) => (
              <div key={number} className="flex gap-4 border-t py-4 last:pb-0">
                <span className="pt-1 font-mono text-xs text-fd-primary">{number}</span>
                <div><p className="font-medium">{title}</p><p className="mt-1 text-sm text-fd-muted-foreground">{text}</p></div>
              </div>
            ))}
          </aside>
        </div>
        <section className="mt-20 grid gap-4 sm:grid-cols-3" aria-label="Ścieżka nauki">
          {[
            { icon: BookOpen, title: 'Najpierw poznaj tablicę', text: 'Uruchom demo i naucz się czytać widoki Status, Board i List.', slug: '01-demo' },
            { icon: Terminal, title: 'Potem przejdź własną ścieżkę', text: 'Skonfiguruj projekt, opisz zadanie i zobacz, co sprawdza workflow.', slug: '03-projekt' },
            { icon: CheckCheck, title: 'Na końcu kontroluj jakość', text: 'Pracuj z agentem, sprawdzaj dowody i uruchamiaj lokalne CI.', slug: '09-dowody' },
          ].map(({ icon: Icon, title, text, slug }) => (
            <Link key={slug} to="/docs/$" params={{ _splat: slug }} className="rounded-xl border p-6 transition-colors hover:bg-fd-accent">
              <Icon size={22} className="mb-4 text-fd-primary" aria-hidden />
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-fd-muted-foreground">{text}</p>
            </Link>
          ))}
        </section>
        <p className="mt-12 text-sm text-fd-muted-foreground">
          Oparty na README, dokumentacji i kodzie tego repozytorium. Bezpieczne ćwiczenia
          w osobnym projekcie, bez automatycznego uruchamiania agentów.
        </p>
      </main>
    </HomeLayout>
  );
}
