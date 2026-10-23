import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Novo pedido' };

// Placeholder — a tela será implementada na próxima etapa.
export default function NovopedidoPage() {
  return (
    <main className="p-8">
      <h1 className="text-xl font-semibold">Novo pedido</h1>
      <p className="text-sm text-muted-foreground">
        Cadastro de pedido de compra
      </p>
    </main>
  );
}
