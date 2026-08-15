import Image from "next/image";
import Link from "next/link";
import { storeConfig } from "@/config/store";
import { formatCurrency } from "@/lib/format";
import { ArrowIcon } from "@/components/icons";

export function ExecutiveSetFeature() {
  return (
    <section className="bg-paper px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
      <div className="mx-auto grid max-w-page overflow-hidden bg-ink text-white lg:grid-cols-[1.08fr_0.92fr]">
        <div className="relative min-h-[440px] lg:min-h-[720px]">
          <Image src="/images/kits/executive-set-editorial.png" alt="Composição do Executive Set com relógio, óculos e case" fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
        </div>
        <div className="flex items-center px-7 py-16 sm:px-12 lg:px-[12%]">
          <div>
            <p className="eyebrow text-white/50">Seleção de lançamento</p>
            <h2 className="mt-5 font-serif text-5xl leading-[0.92] sm:text-6xl">The Executive Set</h2>
            <p className="mt-7 max-w-md text-sm leading-7 text-white/65">Escolha seu relógio. Escolha seus óculos. Construa sua combinação.</p>
            <div className="mt-10 border-y border-white/20 py-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Valor do conjunto</p>
              <p className="mt-2 font-serif text-5xl">{formatCurrency(storeConfig.offer.price)}</p>
            </div>
            <Link href="/kits/executive-set" className="button-light mt-8">Montar meu conjunto <ArrowIcon className="h-4 w-4" /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
