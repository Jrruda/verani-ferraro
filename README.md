# Verani Ferraro — e-commerce

Frontend da Verani Ferraro construído com Next.js App Router, React, TypeScript e Tailwind CSS.

## Arquitetura alvo

- Frontend estático: Next.js (`output: "export"`) em Cloudflare Pages
- API: Cloudflare Worker
- Banco: Cloudflare D1
- Pagamento: Mercado Pago Checkout Pro

O frontend não é fonte de verdade para preços. No checkout, ele enviará apenas identificadores e quantidades; o backend validará catálogo, preço, disponibilidade e total antes de criar o pagamento.

## Desenvolvimento

```bash
pnpm install
pnpm dev
```

Abra `http://localhost:3000`.

## Validação

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Pontos de configuração

- Produtos e associação de imagens: `src/data/products.ts`
- Regras comerciais e benefícios: `src/config/store.ts`
- Abstração de checkout: `src/lib/checkout.ts`
- URL pública da API: `NEXT_PUBLIC_API_URL` em `.env.local`
- Analytics: `.env.example`, `src/components/analytics-scripts.tsx` e `src/lib/analytics.ts`
- Mapeamento das fotos: `docs/catalog-mapping.md`
- Assets editoriais gerados: `docs/image-generation-log.md`

## Segurança

Nunca coloque `MERCADO_PAGO_ACCESS_TOKEN`, webhook secrets ou outras credenciais privadas em variáveis `NEXT_PUBLIC_*`, no código do frontend ou no GitHub. Esses segredos pertencem somente ao Cloudflare Worker.

O checkout permanece desabilitado em `src/config/store.ts` até a API própria estar implantada e validada.
