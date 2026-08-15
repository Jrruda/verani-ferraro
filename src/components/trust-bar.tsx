import { storeConfig } from "@/config/store";

export function TrustBar() {
  const items = [
    storeConfig.freeShipping.enabled ? storeConfig.freeShipping.label : null,
    storeConfig.installments.enabled ? `Até ${storeConfig.installments.installments}x sem juros` : null,
    storeConfig.exchanges.enabled ? `Troca em até ${storeConfig.exchanges.days} dias` : null,
    storeConfig.warranty.enabled ? `Garantia de ${storeConfig.warranty.days} dias` : null,
  ].filter(Boolean) as string[];

  if (!items.length) return null;
  return (
    <section className="border-y border-line bg-ivory" aria-label="Benefícios confirmados">
      <div className="mx-auto grid max-w-page divide-y divide-line px-5 sm:grid-cols-2 sm:divide-x sm:divide-y-0 sm:px-8 lg:grid-cols-4 lg:px-12">
        {items.map((item) => <p key={item} className="px-5 py-5 text-center text-[10px] uppercase tracking-[0.16em]">{item}</p>)}
      </div>
    </section>
  );
}
