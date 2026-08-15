import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Pagamento não concluído" };

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8 sm:py-32">
      <p className="eyebrow">Pagamento</p>
      <h1 className="mt-4 font-serif text-5xl sm:text-6xl">Pagamento não concluído.</h1>
      <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-black/60">
        O pagamento não foi concluído. Você pode voltar ao carrinho e tentar novamente com outra forma de pagamento.
      </p>
      <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/carrinho" className="button-dark">Voltar ao carrinho</Link>
        <Link href="/colecao" className="button-outline">Continuar comprando</Link>
      </div>
    </main>
  );
}
