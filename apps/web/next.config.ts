import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Padrões do Next 16: Cache Components + Partial Prefetching (ver CLAUDE.md, seção Front-end).
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  // A tela inicial é a lista de pedidos.
  async redirects() {
    return [{ source: '/', destination: '/pedidos', permanent: false }];
  },
};

export default nextConfig;
