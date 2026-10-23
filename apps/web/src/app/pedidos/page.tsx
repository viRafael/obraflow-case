import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Pedidos' };

// Placeholder — a tela será implementada na próxima etapa.
export default function PedidosPage() {
  return (
    <main className="p-8">
      <h1 className="text-xl font-semibold">Pedidos</h1>
      <p className="text-sm text-muted-foreground">
        Lista de pedidos e aprovação
      </p>
    </main>
  );
}
