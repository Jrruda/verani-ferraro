import Link from "next/link";
import { storeConfig } from "@/config/store";

const groups = [
  {
    title: "Coleção",
    links: [
      ["Todos os produtos", "/colecao"],
      ["Relógios", "/relogios"],
      ["Óculos de Sol", "/oculos-de-sol"],
      ["Armações", "/armacoes"],
      ["The Executive Set", "/kits/executive-set"],
    ],
  },
  {
    title: "Verani Ferraro",
    links: [
      ["Sobre", "/sobre"],
      ["Atendimento", "/atendimento"],
      ["Trocas", "/politicas/trocas"],
      ["Privacidade", "/politicas/privacidade"],
      ["Termos", "/politicas/termos"],
    ],
  },
] as const;

export function Footer() {
  const hasContact = Boolean(storeConfig.contact.email || storeConfig.contact.whatsapp || storeConfig.socialLinks.instagram);
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-page px-6 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="grid gap-14 border-b border-white/20 pb-16 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <p className="text-lg font-semibold tracking-brand">VERANI FERRARO</p>
            <p className="mt-7 max-w-sm font-serif text-3xl leading-tight text-white/90">A imagem da sua próxima versão.</p>
            <p className="mt-6 max-w-sm text-sm leading-6 text-white/55">Acessórios selecionados para acompanhar quem está construindo algo maior.</p>
          </div>
          {groups.map((group) => (
            <div key={group.title}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">{group.title}</p>
              <ul className="mt-6 space-y-3">
                {group.links.map(([label, href]) => <li key={href}><Link href={href} className="text-sm text-white/75 transition-colors hover:text-white">{label}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 pt-7 text-[10px] uppercase tracking-[0.14em] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Verani Ferraro.</p>
          <p>{hasContact ? "Canais oficiais configurados." : "Canais oficiais em configuração."}</p>
        </div>
      </div>
    </footer>
  );
}
