import type { Metadata } from "next";
import Image from "next/image";
import { storeConfig } from "@/config/store";
import { formatCurrency } from "@/lib/format";
import { KitBuilder } from "@/components/kit-builder";

export const metadata: Metadata = { title: "The Executive Set", description: "Escolha um relógio e um óculos de sol ou armação Verani Ferraro por R$197, com frete grátis para todo o Brasil." };
export default function Page() {
  return (
    <main>
      <section className="relative min-h-[78svh] bg-ink text-white">
        <Image src="/images/lifestyle/men/executive-man.png" alt="Homem em ambiente executivo usando acessórios Verani Ferraro" fill priority sizes="100vw" className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/10" />
        <div className="relative mx-auto flex min-h-[78svh] max-w-page items-end px-5 py-16 sm:px-8 lg:items-center lg:px-12">
          <div className="max-w-xl"><p className="eyebrow text-white/55">The Executive Set</p><h1 className="mt-5 font-serif text-6xl leading-[0.9] sm:text-7xl">Autoridade em cada detalhe.</h1><p className="mt-6 max-w-md text-sm leading-7 text-white/70">Escolha um relógio e um óculos de sol ou armação Verani Ferraro para compor sua presença.</p><p className="mt-7 font-serif text-4xl">{formatCurrency(storeConfig.offer.price)}</p>{storeConfig.freeShipping.enabled && <p className="mt-3 text-xs uppercase tracking-[0.16em] text-white/70">{storeConfig.freeShipping.label}</p>}<a href="#configurador" className="button-light mt-8">Montar meu Executive Set</a></div>
        </div>
      </section>
      <section className="bg-ivory px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-page"><p className="eyebrow">A experiência</p><div className="mt-6 grid border-y border-line sm:grid-cols-3 sm:divide-x sm:divide-line">{["Escolha seu relógio.", "Escolha seus óculos.", "Frete grátis para todo o Brasil."].map((text, index) => <div key={text} className="border-b border-line px-2 py-7 last:border-0 sm:border-0 sm:px-8 sm:py-12"><p className="text-[10px] tracking-[0.16em] text-black/35">0{index + 1}</p><p className="mt-3 font-serif text-2xl">{text}</p></div>)}</div></div>
      </section>
      <KitBuilder />
      <section className="grid bg-ink text-white lg:grid-cols-2">
        <div className="relative min-h-[500px]"><Image src="/images/gifts/gift-case-editorial.png" alt="Case do Executive Set em composição editorial" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /></div>
        <div className="flex items-center px-7 py-20 sm:px-12 lg:px-[12%]"><div><p className="eyebrow text-white/45">Brinde da Coleção Inaugural</p><h2 className="mt-5 font-serif text-5xl">Um detalhe por nossa conta.</h2><p className="mt-6 max-w-md text-sm leading-7 text-white/65">Sua case de óculos acompanha a experiência como cortesia Verani Ferraro, sem cobrança adicional nas compras elegíveis. E o envio é grátis para todo o Brasil.</p><a href="#configurador" className="button-light mt-8">Montar meu conjunto</a></div></div>
      </section>
    </main>
  );
}
