import Image from "next/image";
import Link from "next/link";

export function EditorialSection() {
  return (
    <section className="grid bg-ivory lg:grid-cols-2">
      <div className="relative min-h-[520px] lg:min-h-[760px]">
        <Image src="/images/lifestyle/women/optical-editorial.png" alt="Mulher Verani Ferraro usando armação tartaruga em ambiente profissional" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
      </div>
      <div className="flex items-center px-6 py-20 sm:px-12 lg:px-[10%]">
        <div className="max-w-xl">
          <p className="eyebrow">A mulher Verani Ferraro</p>
          <h2 className="mt-5 font-serif text-5xl leading-[0.95] sm:text-6xl">Presença é uma escolha.</h2>
          <p className="mt-7 max-w-md text-sm leading-7 text-black/65">Para quem entra em uma sala sabendo o que construiu — e o que ainda vai construir. Acessórios que acompanham sua voz, sem falar mais alto que ela.</p>
          <Link href="/armacoes" className="text-link mt-8">Descobrir armações</Link>
        </div>
      </div>
    </section>
  );
}
