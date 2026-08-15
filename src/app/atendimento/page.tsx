import type { Metadata } from "next";
import Link from "next/link";
import { storeConfig } from "@/config/store";

export const metadata: Metadata = { title: "Atendimento", description: "Central de atendimento Verani Ferraro." };
export default function Page() {
  const channelsReady = Boolean(storeConfig.contact.email || storeConfig.contact.whatsapp);
  return (
    <main className="mx-auto min-h-[70svh] max-w-page px-5 py-20 sm:px-8 lg:px-12">
      <p className="eyebrow">Atendimento</p><h1 className="mt-4 max-w-3xl font-serif text-6xl leading-[0.95]">Uma experiência segura também depois da escolha.</h1>
      <div className="mt-12 grid gap-8 border-t border-line pt-10 lg:grid-cols-2"><div><h2 className="font-serif text-3xl">Canais oficiais</h2>{channelsReady ? <p className="mt-4 text-sm text-black/60">Utilize os canais configurados abaixo.</p> : <p className="mt-4 max-w-md text-sm leading-7 text-black/60">E-mail e WhatsApp oficiais ainda estão em configuração. Nenhum contato provisório foi publicado para evitar direcionamento incorreto.</p>}</div><div className="space-y-5"><details className="border-b border-line pb-5"><summary className="cursor-pointer font-serif text-2xl">Como funcionam as lentes?</summary><p className="pt-4 text-sm leading-6 text-black/60">Nesta fase, vendemos somente armações. Lentes de grau personalizadas não estão inclusas.</p></details><details className="border-b border-line pb-5"><summary className="cursor-pointer font-serif text-2xl">Quais condições estão confirmadas?</summary><p className="pt-4 text-sm leading-6 text-black/60">Frete, parcelamento, trocas e garantia serão publicados somente após validação operacional.</p></details><Link href="/colecao" className="text-link">Voltar à coleção</Link></div></div>
    </main>
  );
}
