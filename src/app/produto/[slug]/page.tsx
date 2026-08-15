import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { activeProducts, getProductBySlug } from "@/data/products";
import { ProductGallery } from "@/components/product-gallery";
import { ProductInfo } from "@/components/product-info";
import { ProductGrid } from "@/components/product-grid";
import { EventTracker } from "@/components/event-tracker";

export function generateStaticParams() { return activeProducts.map((product) => ({ slug: product.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return { title: product.name, description: product.description, alternates: { canonical: `/produto/${product.slug}` }, openGraph: { images: [{ url: product.images.main, alt: product.name }] } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();
  const related = activeProducts.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4);
  const productJsonLd = { "@context": "https://schema.org", "@type": "Product", name: product.name, image: Array.from(new Set([product.images.main, product.images.front].filter(Boolean))), description: product.description, category: product.categoryLabel, ...(product.price !== undefined ? { offers: { "@type": "Offer", priceCurrency: "BRL", price: product.price, availability: "https://schema.org/InStock" } } : {}) };
  return (
    <main>
      <EventTracker event="view_item" payload={{ item_id: product.id, item_name: product.name, category: product.category }} />
      <div className="mx-auto max-w-page px-5 py-5 text-[9px] uppercase tracking-[0.14em] text-black/45 sm:px-8 lg:px-12"><Link href="/colecao">Coleção</Link><span className="px-2">/</span><span>{product.name}</span></div>
      <section className="mx-auto grid max-w-page gap-10 px-5 pb-20 sm:px-8 lg:grid-cols-[1.35fr_0.65fr] lg:px-12"><ProductGallery product={product} /><ProductInfo product={product} /></section>
      {related.length > 0 && <section className="border-t border-line px-5 py-20 sm:px-8 lg:px-12"><div className="mx-auto max-w-page"><p className="eyebrow">Também nesta curadoria</p><h2 className="mb-9 mt-3 font-serif text-4xl">Continue explorando.</h2><ProductGrid products={related} /></div></section>}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c") }} />
    </main>
  );
}
