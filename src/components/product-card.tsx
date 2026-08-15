"use client";

import Link from "next/link";
import type { Product } from "@/types/product";
import { formatCurrency } from "@/lib/format";
import { trackEvent } from "@/lib/analytics";
import { ProductMedia } from "@/components/product-media";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  return (
    <article className="group min-w-0">
      <Link href={`/produto/${product.slug}`} onClick={() => trackEvent("select_item", { item_id: product.id, item_name: product.name })}>
        <div className="relative aspect-[4/5] overflow-hidden bg-white">
          <ProductMedia product={product} priority={priority} sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
          <span className="absolute bottom-3 left-3 bg-paper/90 px-2.5 py-1.5 text-[9px] uppercase tracking-[0.14em] opacity-0 transition-opacity group-hover:opacity-100">Ver detalhes</span>
        </div>
        <div className="pt-4">
          <p className="text-[9px] uppercase tracking-[0.16em] text-black/45">{product.categoryLabel}</p>
          <div className="mt-1.5 flex items-start justify-between gap-3">
            <h3 className="min-w-0 font-serif text-lg leading-tight sm:text-xl">{product.name}</h3>
            <p className="shrink-0 text-xs sm:text-sm">{product.price !== undefined ? formatCurrency(product.price) : "Sob definição"}</p>
          </div>
          {product.colors?.length ? <p className="mt-2 text-[11px] text-black/50">{product.colors.join(" · ")}</p> : null}
        </div>
      </Link>
    </article>
  );
}
