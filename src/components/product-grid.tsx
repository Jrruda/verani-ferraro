import type { Product } from "@/types/product";
import { ProductCard } from "@/components/product-card";

export function ProductGrid({ products, priorityCount = 0, editorialFirst = false }: { products: Product[]; priorityCount?: number; editorialFirst?: boolean }) {
  if (!products.length) {
    return <div className="border-y border-line py-20 text-center"><p className="font-serif text-3xl">Nenhuma peça nesta seleção.</p><p className="mt-3 text-sm text-black/55">A curadoria será atualizada em breve.</p></div>;
  }
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-3 lg:gap-x-6 xl:grid-cols-4">
      {products.map((product, index) => (
        <div key={product.id} className={editorialFirst && index === 0 ? "editorial-product-frame relative p-2 sm:p-3" : ""}>
          <ProductCard product={product} priority={index < priorityCount} />
        </div>
      ))}
    </div>
  );
}
