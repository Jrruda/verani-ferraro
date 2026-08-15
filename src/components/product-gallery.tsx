import Image from "next/image";
import type { Product } from "@/types/product";

export function ProductGallery({ product }: { product: Product }) {
  const images = Array.from(new Set([product.images.main, product.images.front, ...(product.images.gallery ?? []), ...(product.images.lifestyle ?? [])].filter((src): src is string => Boolean(src))));
  return (
    <div className={`grid gap-3 ${images.length > 1 ? "sm:grid-cols-2" : ""}`}>
      {images.map((src, index) => (
        <div key={`${src}-${index}`} className={`relative min-h-[480px] overflow-hidden ${index === 0 ? "bg-white" : "bg-ivory"}`}>
          <Image src={src} alt={`${product.name}${index === 0 ? " — vista diagonal" : src === product.images.front ? " — vista frontal" : ` — imagem ${index + 1}`}`} fill priority={index === 0} sizes="(max-width: 1024px) 100vw, 35vw" className={index === 0 || src.includes("products") ? "object-contain p-[6%]" : "object-cover"} />
        </div>
      ))}
    </div>
  );
}
