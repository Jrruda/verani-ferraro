import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = { title: "Sobre", description: "Conheça o posicionamento e a visão da Verani Ferraro." };
export default function Page() {
  return (
    <main>
      <section className="bg-ink px-5 py-24 text-white sm:px-8 sm:py-32 lg:px-12 lg:py-40"><div className="mx-auto max-w-page"><p className="eyebrow text-white/45">Sobre a Verani Ferraro</p><h1 className="mt-6 max-w-6xl font-serif text-6xl leading-[0.9] sm:text-7xl lg:text-8xl">Não é sobre parecer outra pessoa. É sobre vestir quem você está se tornando.</h1></div></section>
      <section className="mx-auto grid max-w-page gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:px-12"><div className="relative min-h-[580px]"><Image src="/images/lifestyle/women/optical-editorial.png" alt="Mulher Verani Ferraro em ambiente profissional" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /></div><div className="flex items-center"><div className="max-w-lg"><p className="eyebrow">Uma marca brasileira</p><h2 className="mt-4 font-serif text-5xl">Construída para quem está construindo.</h2><p className="mt-7 text-sm leading-7 text-black/65">A Verani Ferraro nasce para acompanhar pessoas em movimento: criando carreiras, negócios e novas versões de si mesmas. Nossa inspiração estética é italiana; nossa história começa no Brasil.</p><p className="mt-5 text-sm leading-7 text-black/65">Relógios e óculos são escolhidos como símbolos visuais de identidade, presença e intenção. Sem excessos. Sem histórias inventadas. Com uma curadoria que faz cada peça ter um lugar.</p><Link href="/colecao" className="button-dark mt-8">Descobrir a coleção</Link></div></div></section>
    </main>
  );
}
