import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { storeConfig } from "@/config/store";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = { title: "Kits", description: "Conheça o The Executive Set Verani Ferraro." };
export default function Page() {
  return (
    <main className="bg-ivory">
      <section className="mx-auto grid min-h-[720px] max-w-page lg:grid-cols-2">
        <div className="relative min-h-[520px] lg:min-h-full"><Image src="/images/kits/executive-set-editorial.png" alt="The Executive Set" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /></div>
        <div className="flex items-center px-6 py-20 sm:px-12 lg:px-[12%]">
          <div><p className="eyebrow">Kits · Coleção inaugural</p><h1 className="mt-5 font-serif text-6xl leading-[0.9] sm:text-7xl">The Executive Set</h1><p className="mt-7 max-w-md text-sm leading-7 text-black/60">Um relógio, um óculos e uma experiência de seleção construída por você.</p><p className="mt-8 font-serif text-4xl">{formatCurrency(storeConfig.offer.price)}</p><Link href="/kits/executive-set" className="button-dark mt-8">Descobrir e montar</Link></div>
        </div>
      </section>
    </main>
  );
}
