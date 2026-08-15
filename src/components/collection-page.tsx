import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types/product";
import { ProductGrid } from "@/components/product-grid";
import { EventTracker } from "@/components/event-tracker";

export function CollectionPage({ eyebrow, title, description, products, note, heroImage, heroAlt, editorialFirst = false }: { eyebrow: string; title: string; description: string; products: Product[]; note?: string; heroImage?: string; heroAlt?: string; editorialFirst?: boolean }) {
  return (
    <main>
      <EventTracker event="view_item_list" payload={{ item_list_name: title, items: products.map((product) => product.id) }} />
      <section className="border-b border-line bg-ivory">
        <div className={`mx-auto max-w-page ${heroImage ? "grid lg:grid-cols-[0.9fr_1.1fr]" : ""}`}>
          <div className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
          <nav aria-label="Breadcrumb" className="text-[10px] uppercase tracking-[0.16em] text-black/45"><Link href="/">Início</Link><span className="px-2">/</span>{eyebrow}</nav>
          <div className="mt-10 max-w-3xl">
            <p className="eyebrow">Coleção inaugural · {products.length} {products.length === 1 ? "peça" : "peças"}</p>
            <h1 className="mt-4 font-serif text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">{title}</h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-black/65 sm:text-base">{description}</p>
            {note && <p className="mt-4 border-l border-ink pl-4 text-xs leading-5 text-black/55">{note}</p>}
          </div>
          </div>
          {heroImage && <div className="relative min-h-[520px] lg:min-h-[620px]"><Image src={heroImage} alt={heroAlt ?? title} fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" /></div>}
        </div>
      </section>
      <section className="mx-auto max-w-page px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <div className="mb-8 flex items-center justify-between border-b border-line pb-4">
          <p className="text-[10px] uppercase tracking-[0.18em]">Seleção completa</p>
          <p className="text-[10px] uppercase tracking-[0.14em] text-black/45">Curadoria, sem excesso</p>
        </div>
        <ProductGrid products={products} priorityCount={4} editorialFirst={editorialFirst} />
      </section>
    </main>
  );
}
