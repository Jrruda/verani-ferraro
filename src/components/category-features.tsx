import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "@/components/icons";

const categories = [
  { title: "Relógios", href: "/relogios", image: "/images/products/watches/verona-front.png", className: "lg:col-span-2" },
  { title: "Óculos de Sol", href: "/oculos-de-sol", image: "/images/products/sunglasses/sunglasses-05-main.png", className: "" },
  { title: "Armações", href: "/armacoes", image: "/images/products/optical/optical-05-diagonal.png", className: "" },
] as const;

export function CategoryFeatures() {
  return (
    <section className="mx-auto max-w-page px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
      <div className="mb-10 flex items-end justify-between gap-6 border-b border-line pb-5">
        <div><p className="eyebrow">A coleção</p><h2 className="mt-3 font-serif text-4xl sm:text-5xl">Escolha sua presença.</h2></div>
        <p className="hidden max-w-xs text-right text-xs leading-5 text-black/50 md:block">Poucas peças. Uma seleção construída para dizer mais com menos.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {categories.map((category, index) => (
          <Link key={category.href} href={category.href} className={`group relative min-h-[440px] overflow-hidden bg-white sm:min-h-[520px] ${category.className}`}>
            <Image src={category.image} alt={`Coleção de ${category.title}`} fill sizes={index === 0 ? "(max-width: 1024px) 100vw, 66vw" : "(max-width: 1024px) 100vw, 33vw"} className="object-contain p-[9%] transition-transform duration-700 ease-quiet group-hover:scale-[1.035]" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/55 via-black/10 to-transparent px-6 pb-6 pt-24 text-white sm:px-8 sm:pb-8">
              <div><p className="text-[9px] uppercase tracking-[0.2em] text-white/65">0{index + 1}</p><h3 className="mt-2 font-serif text-3xl sm:text-4xl">{category.title}</h3></div>
              <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em]">Explorar coleção <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
