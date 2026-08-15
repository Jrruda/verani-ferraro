"use client";

import Link from "next/link";
import type { Product } from "@/types/product";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/components/cart-provider";

export function ProductInfo({ product }: { product: Product }) {
  const { addItem } = useCart();
  const canBuyIndividually = product.price !== undefined;

  return (
    <div className="lg:sticky lg:top-32">
      <p className="eyebrow">Coleção inaugural · {product.categoryLabel}</p>
      <h1 className="mt-4 font-serif text-5xl leading-none sm:text-6xl">{product.name}</h1>
      <p className="mt-5 text-lg">{product.price !== undefined ? formatCurrency(product.price) : "Valor individual em definição"}</p>
      <p className="mt-7 border-t border-line pt-7 text-sm leading-7 text-black/65">{product.description}</p>

      {product.colors?.length ? (
        <div className="mt-7">
          <p className="text-[10px] uppercase tracking-[0.16em] text-black/45">Cor aparente</p>
          <p className="mt-2 text-sm">{product.colors.join(" · ")}</p>
        </div>
      ) : null}

      {product.includesPrescriptionLenses === false && (
        <div className="mt-7 border border-ink px-4 py-3 text-sm"><strong>Lentes não inclusas.</strong> Esta seleção contempla somente a armação.</div>
      )}

      <div className="mt-8 space-y-3">
        {canBuyIndividually ? (
          <button className="button-dark w-full" onClick={() => addItem({ id: product.id, name: product.name, image: product.images.main, price: product.price!, kind: "product" })}>Adicionar ao carrinho</button>
        ) : product.eligibleForExecutiveSet ? (
          <Link href="/kits/executive-set" className="button-dark w-full">Selecionar no Executive Set</Link>
        ) : (
          <button className="button-disabled w-full" disabled>Compra individual em configuração</button>
        )}
        <Link href="/atendimento" className="button-outline w-full">Solicitar informações</Link>
      </div>

      <div className="mt-9 divide-y divide-line border-y border-line">
        <details className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between text-xs uppercase tracking-[0.14em]">Detalhes cadastrados<span className="text-lg transition-transform group-open:rotate-45">+</span></summary>
          <div className="pt-4 text-sm leading-6 text-black/60">
            {product.materials?.length ? <p>Materiais: {product.materials.join(", ")}</p> : <p>Especificações técnicas aguardando confirmação do fornecedor.</p>}
          </div>
        </details>
        <details className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between text-xs uppercase tracking-[0.14em]">Entrega, trocas e garantia<span className="text-lg transition-transform group-open:rotate-45">+</span></summary>
          <p className="pt-4 text-sm leading-6 text-black/60">Condições operacionais serão exibidas aqui somente após confirmação e habilitação da loja.</p>
        </details>
      </div>
    </div>
  );
}
