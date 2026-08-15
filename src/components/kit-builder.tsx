"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { getProductById, getProductsByCategory } from "@/data/products";
import { storeConfig } from "@/config/store";
import { formatCurrency } from "@/lib/format";
import { trackEvent } from "@/lib/analytics";
import { useCart } from "@/components/cart-provider";
import { ArrowIcon, CheckIcon } from "@/components/icons";
import { ProductMedia } from "@/components/product-media";
import type { Product, ProductCategory } from "@/types/product";

const steps = ["Relógio", "Óculos", "Cortesia", "Resumo"];
const TRANSITION_MS = 280;

type Transition = { from: number; to: number; direction: "forward" | "back" };

export function KitBuilder() {
  const watches = getProductsByCategory("watch").filter((product) => product.eligibleForExecutiveSet);
  const sunglasses = getProductsByCategory("sunglasses").filter((product) => product.eligibleForExecutiveSet);
  const opticalFrames = getProductsByCategory("optical-frame").filter((product) => product.eligibleForExecutiveSet);
  const glasses = [...sunglasses, ...opticalFrames];
  const gift = getProductById(storeConfig.executiveSet.includedGift.productId);
  const [step, setStep] = useState(1);
  const [transition, setTransition] = useState<Transition | null>(null);
  const [watchId, setWatchId] = useState("");
  const [glassesId, setGlassesId] = useState("");
  const [glassesCategory, setGlassesCategory] = useState<Extract<ProductCategory, "sunglasses" | "optical-frame">>("sunglasses");
  const { addItem } = useCart();
  const watch = watches.find((product) => product.id === watchId);
  const selectedGlasses = glasses.find((product) => product.id === glassesId);
  const canContinue = (step === 1 && Boolean(watchId)) || (step === 2 && Boolean(glassesId)) || step >= 3;

  useEffect(() => {
    if (!transition) return;
    const timer = window.setTimeout(() => {
      setStep(transition.to);
      setTransition(null);
    }, TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [transition]);

  const details = useMemo(
    () => [watch?.name, selectedGlasses?.name].filter(Boolean).join(" · "),
    [watch, selectedGlasses],
  );

  function choose(type: "watch" | "glasses", product: Product) {
    if (type === "watch") {
      setWatchId(product.id);
      trackEvent("executive_set_select_watch", { item_id: product.id, item_name: product.name, value: storeConfig.offer.price });
      return;
    }
    setGlassesId(product.id);
    trackEvent("executive_set_select_glasses", { item_id: product.id, item_name: product.name, category: product.category, value: storeConfig.offer.price });
  }

  function moveTo(target: number) {
    if (transition || target === step) return;
    setTransition({ from: step, to: target, direction: target > step ? "forward" : "back" });
  }

  function next() {
    if (!canContinue) return;
    if (step === 3 && gift) trackEvent("executive_set_select_gift", { item_id: gift.id, item_name: gift.name, value: 0 });
    moveTo(Math.min(4, step + 1));
  }

  function addSet() {
    if (!watch || !selectedGlasses) return;
    const id = `executive-set:${watch.id}:${selectedGlasses.id}`;
    addItem({
      id,
      name: storeConfig.offer.name,
      image: watch.images.main,
      price: storeConfig.offer.price,
      kind: "executive-set",
      details,
      selection: { watchId: watch.id, glassesId: selectedGlasses.id },
      ...(gift && storeConfig.executiveSet.includedGift.enabled ? {
        complimentaryItem: {
          name: gift.name,
          label: storeConfig.executiveSet.includedGift.label,
          price: storeConfig.executiveSet.includedGift.price,
        },
      } : {}),
    });
    trackEvent("executive_set_complete", {
      watch_id: watch.id,
      glasses_id: selectedGlasses.id,
      glasses_category: selectedGlasses.category,
      value: storeConfig.offer.price,
    });
  }

  function renderStep(number: number) {
    if (number === 1) {
      return <SelectionStep title="Escolha seu relógio." products={watches} selectedId={watchId} onSelect={(product) => choose("watch", product)} />;
    }
    if (number === 2) {
      const visibleGlasses = glassesCategory === "sunglasses" ? sunglasses : opticalFrames;
      return (
        <div>
          <p className="eyebrow">Seleção elegível</p>
          <h3 className="mt-3 font-serif text-4xl sm:text-5xl">Escolha seus óculos.</h3>
          <p className="mt-4 max-w-xl text-sm leading-6 text-black/60">Seu conjunto pode incluir um óculos de sol ou uma armação.</p>
          <div className="mt-7 grid grid-cols-2 border border-ink p-1" role="tablist" aria-label="Categoria de óculos">
            {(["sunglasses", "optical-frame"] as const).map((category) => {
              const active = glassesCategory === category;
              return <button key={category} type="button" role="tab" aria-selected={active} onClick={() => setGlassesCategory(category)} className={`min-h-11 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${active ? "bg-ink text-white" : "bg-transparent text-black/55"}`}>{category === "sunglasses" ? "Óculos de Sol" : "Armações"}</button>;
            })}
          </div>
          {selectedGlasses && <p className="mt-4 flex items-center gap-2 text-xs text-black/65"><CheckIcon className="h-4 w-4" /> Seleção atual: <strong>{selectedGlasses.name}</strong> · {selectedGlasses.categoryLabel}</p>}
          <ProductOptions products={visibleGlasses} selectedId={glassesId} onSelect={(product) => choose("glasses", product)} />
        </div>
      );
    }
    if (number === 3) {
      return (
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow">Etapa 03 · Cortesia</p>
          <h3 className="mt-3 font-serif text-4xl sm:text-5xl">Um detalhe por nossa conta.</h3>
          {gift && storeConfig.executiveSet.includedGift.enabled && (
            <div className="mt-8 grid items-center gap-6 border border-line bg-white p-5 sm:grid-cols-[240px_1fr] sm:p-7">
              <div className="relative aspect-[4/3] bg-white"><Image src={gift.images.main} alt={`${gift.name} — ${storeConfig.executiveSet.includedGift.label}`} fill sizes="240px" className="object-contain p-4" /></div>
              <div>
                <p className="eyebrow">{storeConfig.executiveSet.includedGift.label}</p>
                <h4 className="mt-2 font-serif text-2xl">{gift.name}</h4>
                <p className="mt-3 text-sm leading-6 text-black/60">Sua case acompanha a experiência como cortesia Verani Ferraro, sem cobrança adicional.</p>
                <p className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.13em]"><CheckIcon className="h-4 w-4" /> Incluída · {formatCurrency(storeConfig.executiveSet.includedGift.price)}</p>
              </div>
            </div>
          )}
        </div>
      );
    }
    if (number === 4 && watch && selectedGlasses) {
      return (
        <div className="mx-auto max-w-4xl">
          <p className="eyebrow text-center">Sua seleção</p>
          <h3 className="mt-3 text-center font-serif text-4xl sm:text-5xl">A imagem da sua próxima versão.</h3>
          <div className="mt-9 grid gap-3 sm:grid-cols-3">
            {[watch, selectedGlasses].map((product) => (
              <div key={product.id} className="bg-white p-4"><div className="relative aspect-square"><Image src={product.images.main} alt={product.name} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-contain p-3" /></div><p className="mt-3 text-[9px] uppercase tracking-[0.16em] text-black/45">{product.categoryLabel}</p><p className="mt-1 font-serif text-xl">{product.name}</p></div>
            ))}
            {gift && storeConfig.executiveSet.includedGift.enabled && <div className="border border-line bg-white p-4"><div className="relative aspect-square"><Image src={gift.images.main} alt={gift.name} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-contain p-3" /></div><p className="mt-3 text-[9px] uppercase tracking-[0.16em] text-black/45">{storeConfig.executiveSet.includedGift.label}</p><p className="mt-1 font-serif text-xl">{gift.name}</p><p className="mt-2 text-xs">{formatCurrency(storeConfig.executiveSet.includedGift.price)}</p></div>}
          </div>
          <div className="mt-6 flex flex-col items-start justify-between gap-5 border-y border-ink py-6 sm:flex-row sm:items-center">
            <div><p className="text-[10px] uppercase tracking-[0.16em] text-black/45">Valor total</p><p className="mt-1 font-serif text-4xl">{formatCurrency(storeConfig.offer.price)}</p></div>
            <button className="button-dark w-full sm:w-auto" onClick={addSet}>Adicionar conjunto ao carrinho</button>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <section id="configurador" className="bg-paper py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="text-center"><p className="eyebrow">Construa sua combinação</p><h2 className="mt-4 font-serif text-4xl sm:text-6xl">Seu Executive Set, em quatro passos.</h2><p className="mt-5 font-serif text-3xl">{formatCurrency(storeConfig.offer.price)}</p></div>
        <ol className="mt-10 grid grid-cols-4 border-y border-line" aria-label="Etapas do configurador">
          {steps.map((label, index) => {
            const number = index + 1;
            const current = (transition?.to ?? step) === number;
            return <li key={label} aria-current={current ? "step" : undefined} className={`px-1 py-4 text-center text-[8px] uppercase tracking-[0.08em] sm:text-[10px] sm:tracking-[0.16em] ${current ? "bg-ink text-white" : number < (transition?.to ?? step) ? "text-black" : "text-black/35"}`}><span className="hidden sm:inline">0{number} · </span>{label}</li>;
          })}
        </ol>

        <div className="kit-stage py-10 sm:py-14" aria-live="polite">
          {transition ? (
            <>
              <div className={`kit-panel ${transition.direction === "forward" ? "kit-exit-left" : "kit-exit-right"}`}>{renderStep(transition.from)}</div>
              <div className={`kit-panel ${transition.direction === "forward" ? "kit-enter-right" : "kit-enter-left"}`}>{renderStep(transition.to)}</div>
            </>
          ) : <div className="kit-panel">{renderStep(step)}</div>}
        </div>

        <div className="sticky bottom-0 z-30 -mx-5 flex items-center justify-between border-t border-line bg-paper/95 px-5 py-4 backdrop-blur-md sm:static sm:mx-0 sm:px-0 sm:pt-5">
          <button className={`text-link ${step === 1 ? "invisible" : ""}`} disabled={Boolean(transition)} onClick={() => moveTo(Math.max(1, step - 1))}>Voltar</button>
          {step < 4 && <button className={canContinue && !transition ? "button-dark" : "button-disabled"} disabled={!canContinue || Boolean(transition)} onClick={next}>Continuar <ArrowIcon className="h-4 w-4" /></button>}
        </div>
      </div>
    </section>
  );
}

function SelectionStep({ title, products, selectedId, onSelect }: { title: string; products: Product[]; selectedId: string; onSelect: (product: Product) => void }) {
  return <div><p className="eyebrow">Seleção elegível</p><h3 className="mt-3 font-serif text-4xl sm:text-5xl">{title}</h3><ProductOptions products={products} selectedId={selectedId} onSelect={onSelect} /></div>;
}

function ProductOptions({ products, selectedId, onSelect }: { products: Product[]; selectedId: string; onSelect: (product: Product) => void }) {
  return (
    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => {
        const selected = selectedId === product.id;
        return (
          <button key={product.id} type="button" onClick={() => onSelect(product)} className={`group relative min-w-0 bg-white p-3 text-left outline-none ring-offset-2 transition ${selected ? "ring-2 ring-ink" : "hover:ring-1 hover:ring-black/30 focus-visible:ring-2 focus-visible:ring-ink"}`} aria-pressed={selected}>
            {selected && <span className="absolute right-3 top-3 z-10 grid h-6 w-6 place-items-center rounded-full bg-ink text-white"><CheckIcon className="h-3.5 w-3.5" /></span>}
            <div className="relative aspect-square overflow-hidden"><ProductMedia product={product} sizes="(max-width: 640px) 50vw, 25vw" /></div>
            <p className="mt-3 text-[9px] uppercase tracking-[0.14em] text-black/45">{product.categoryLabel}</p>
            <p className="mt-1 font-serif text-base leading-tight sm:text-lg">{product.name}</p>
          </button>
        );
      })}
    </div>
  );
}
