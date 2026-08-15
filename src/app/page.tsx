import Link from "next/link";
import { Hero } from "@/components/hero";
import { CategoryFeatures } from "@/components/category-features";
import { Manifesto } from "@/components/manifesto";
import { ProductGrid } from "@/components/product-grid";
import { featuredProducts } from "@/data/products";
import { EditorialSection } from "@/components/editorial-section";
import { ExecutiveSetFeature } from "@/components/executive-set-feature";
import { TrustBar } from "@/components/trust-bar";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <CategoryFeatures />
      <Manifesto />
      <section className="mx-auto max-w-page px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
        <div className="mb-10 flex items-end justify-between gap-5 border-b border-line pb-5">
          <div><p className="eyebrow">Curadoria em destaque</p><h2 className="mt-3 font-serif text-4xl sm:text-5xl">Peças que definem a estreia.</h2></div>
          <Link href="/colecao" className="text-link hidden sm:inline-flex">Ver coleção completa</Link>
        </div>
        <ProductGrid products={featuredProducts} />
        <Link href="/colecao" className="button-outline mt-10 w-full sm:hidden">Ver coleção completa</Link>
      </section>
      <EditorialSection />
      <ExecutiveSetFeature />
      <TrustBar />
      <section className="bg-ivory px-5 py-24 text-center sm:px-8 sm:py-32">
        <p className="eyebrow">Verani Ferraro</p>
        <h2 className="mx-auto mt-5 max-w-4xl font-serif text-5xl leading-[0.95] sm:text-7xl">Não é sobre parecer outra pessoa.</h2>
        <p className="mx-auto mt-6 max-w-lg text-sm leading-7 text-black/60">É sobre vestir, com intenção, quem você está se tornando.</p>
        <Link href="/sobre" className="button-dark mt-8">Conhecer a marca</Link>
      </section>
    </main>
  );
}
