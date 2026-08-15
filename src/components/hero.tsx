import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "@/components/icons";

export function Hero() {
  return (
    <section className="relative min-h-[calc(100svh-104px)] overflow-hidden bg-ink text-white lg:min-h-[calc(100svh-112px)]">
      <Image src="/images/lifestyle/women/hero-verani-desktop.png" alt="Mulher em ambiente executivo usando acessórios Verani Ferraro" fill priority sizes="(max-width: 767px) 1px, 100vw" className="hidden object-cover object-center md:block" />
      <Image src="/images/lifestyle/women/hero-verani-mobile.png" alt="Mulher em ambiente executivo usando acessórios Verani Ferraro" fill priority sizes="100vw" className="object-cover object-center md:hidden" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-black/5" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15 md:hidden" />
      <div className="relative mx-auto flex min-h-[calc(100svh-104px)] max-w-page items-end px-5 pb-14 pt-28 sm:px-8 md:items-center md:pb-0 lg:min-h-[calc(100svh-112px)] lg:px-12">
        <div className="max-w-2xl">
          <p className="eyebrow text-white/65">Verani Ferraro · Coleção inaugural</p>
          <h1 className="mt-5 max-w-xl font-serif text-[clamp(3.25rem,8vw,6.8rem)] leading-[0.88] tracking-[-0.045em]">Autoridade não se pede. Se veste.</h1>
          <p className="mt-6 max-w-md text-sm leading-6 text-white/78 sm:text-base">Acessórios para a imagem de quem está construindo algo maior.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/colecao" className="button-light">Conhecer a coleção <ArrowIcon className="h-4 w-4" /></Link>
            <Link href="/kits/executive-set" className="button-ghost-light">Descobrir o Executive Set</Link>
          </div>
        </div>
      </div>
      <p className="absolute bottom-6 right-8 hidden text-[9px] uppercase tracking-[0.2em] text-white/45 lg:block">Presença · Identidade · Ambição</p>
    </section>
  );
}
