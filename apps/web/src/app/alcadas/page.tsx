import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Alçadas' };

// Placeholder — a tela será implementada na próxima etapa.
export default function AlcadasPage() {
  return (
    <main className="p-8">
      <h1 className="text-xl font-semibold">Alçadas</h1>
      <p className="text-sm text-muted-foreground">Regras de alçada por obra</p>
    </main>
  );
}
