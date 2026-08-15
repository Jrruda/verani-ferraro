import Link from "next/link";

export function PolicyPage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto min-h-[70svh] max-w-4xl px-5 py-20 sm:px-8 sm:py-28">
      <nav aria-label="Breadcrumb" className="text-[10px] uppercase tracking-[0.14em] text-black/45"><Link href="/">Início</Link><span className="px-2">/</span>{eyebrow}</nav>
      <p className="eyebrow mt-10">{eyebrow}</p><h1 className="mt-4 font-serif text-5xl sm:text-6xl">{title}</h1><p className="mt-6 max-w-2xl text-sm leading-7 text-black/60">{intro}</p>
      <div className="mt-12 space-y-8 border-t border-line pt-10 text-sm leading-7 text-black/65">{children}</div>
    </main>
  );
}
