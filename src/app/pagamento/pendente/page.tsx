import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Pagamento pendente" };

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8 sm:py-32">
      <p className="eyebrow">Pagamento</p>
      <h1 className="mt-4 font-serif text-5xl sm:text-6xl">Pagamento em análise.</h1>
      <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-black/60">
        Seu pedido foi recebido e o pagamento ainda está pendente de confirmação. Assim que o Mercado Pago atualizar o status, nosso sistema registra a mudança automaticamente.
      </p>
      <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/colecao" className="button-dark">Continuar comprando</Link>
        <Link href="/" className="button-outline">Voltar ao início</Link>
      </div>
    </main>
  );
}
