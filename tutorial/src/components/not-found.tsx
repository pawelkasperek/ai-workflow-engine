import { baseOptions } from '@/lib/layout.shared';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { Link } from '@tanstack/react-router';

export function NotFound() {
  return (
    <HomeLayout {...baseOptions()}>
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="text-sm text-fd-muted-foreground">404 · Nie ma takiej lekcji</p>
        <h1 className="my-6 text-3xl font-semibold">Wróćmy do planu nauki</h1>
        <Link to="/docs/$" params={{ _splat: '' }} className="text-fd-primary underline">
          Otwórz spis lekcji
        </Link>
      </main>
    </HomeLayout>
  );
}
