# Migração: Wix/Yampi → Cloudflare + Mercado Pago

## Concluído nesta etapa

- Frontend desacoplado de Wix Stores, Wix Ecom, Wix Checkout e Yampi.
- Dependências Wix removidas do `package.json` e do importer do lockfile.
- Carrinho preservado no navegador.
- Executive Set agora guarda IDs próprios (`watchId` e `glassesId`).
- `src/lib/checkout.ts` cria um payload mínimo, sem preços enviados como fonte de verdade.
- `NEXT_PUBLIC_API_URL` preparado para apontar ao Cloudflare Worker.
- Checkout comercial mantido desabilitado até o backend existir.

## Contrato inicial do frontend para `POST /checkout`

Produto individual:

```json
{
  "kind": "product",
  "productId": "watch-01",
  "quantity": 1
}
```

Executive Set:

```json
{
  "kind": "executive-set",
  "watchId": "watch-01",
  "glassesId": "sunglasses-01",
  "quantity": 1
}
```

O backend será responsável por buscar os produtos no D1, validar elegibilidade, calcular preços e criar o checkout no Mercado Pago.

## Próximas etapas

1. Versionar o frontend em GitHub.
2. Publicar o frontend em Cloudflare Pages.
3. Criar o Worker e o D1.
4. Migrar catálogo e regras comerciais para o banco.
5. Implementar `POST /checkout`.
6. Integrar Checkout Pro e webhook do Mercado Pago.
7. Criar fluxo de pedidos, estoque e retornos de pagamento.
8. Testar ponta a ponta em ambiente de teste.
9. Ativar produção.
