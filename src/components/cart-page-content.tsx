"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { formatCurrency } from "@/lib/format";
import { storeConfig } from "@/config/store";
import { trackEvent } from "@/lib/analytics";
import { MinusIcon, PlusIcon } from "@/components/icons";
import { startCheckout, type CheckoutCustomer } from "@/lib/checkout";

const initialCustomer: CheckoutCustomer = {
  fullName: "",
  email: "",
  phone: "",
  document: "",
  zipCode: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
};

export function CartPageContent() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const [checkoutState, setCheckoutState] = useState<"idle" | "loading" | "error">("idle");
  const [checkoutError, setCheckoutError] = useState("");
  const [customer, setCustomer] = useState<CheckoutCustomer>(initialCustomer);

  if (!items.length) {
    return <div className="mx-auto max-w-xl px-5 py-28 text-center"><p className="eyebrow">Carrinho vazio</p><h1 className="mt-4 font-serif text-5xl">Escolha a presença que acompanha você.</h1><p className="mt-5 text-sm leading-6 text-black/55">Sua seleção fica salva neste dispositivo.</p><Link href="/colecao" className="button-dark mt-8">Conhecer a coleção</Link></div>;
  }

  function updateField<K extends keyof CheckoutCustomer>(field: K, value: CheckoutCustomer[K]) {
    setCustomer((current) => ({ ...current, [field]: value }));
  }

  async function beginCheckout() {
    trackEvent("view_cart", { value: subtotal, items: items.length });
    trackEvent("begin_checkout", { value: subtotal, items: items.length });
    setCheckoutState("loading");
    setCheckoutError("");
    try {
      if (!storeConfig.checkout.enabled) {
        throw new Error("O pagamento ainda está em configuração. Tente novamente em breve.");
      }
      await startCheckout(items, customer);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Não foi possível preparar o checkout.");
      setCheckoutState("error");
    }
  }

  return (
    <div className="mx-auto max-w-page px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
      <p className="eyebrow">Sua seleção</p><h1 className="mt-4 font-serif text-5xl sm:text-6xl">Carrinho</h1>
      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px]">
        <div className="space-y-10">
          <div className="divide-y divide-line border-y border-line">
            {items.map((item) => (
              <article key={item.id} className="grid grid-cols-[104px_1fr] gap-5 py-6 sm:grid-cols-[140px_1fr_auto] sm:items-center">
                <div className="relative aspect-square bg-white"><Image src={item.image} alt="" fill sizes="140px" className="object-contain p-3" /></div>
                <div><p className="text-[9px] uppercase tracking-[0.16em] text-black/45">{item.kind === "executive-set" ? "Conjunto" : "Produto"}</p><h2 className="mt-1 font-serif text-2xl">{item.name}</h2>{item.details && <p className="mt-2 text-xs leading-5 text-black/55">{item.details}</p>}{item.complimentaryItem && <div className="mt-3 border-l border-ink pl-3"><p className="text-xs">{item.complimentaryItem.name}</p><p className="mt-1 text-[9px] uppercase tracking-[0.13em] text-black/50">{item.complimentaryItem.label} · {formatCurrency(item.complimentaryItem.price)}</p></div>}<button onClick={() => removeItem(item.id)} className="mt-4 text-xs underline underline-offset-4">Remover</button></div>
                <div className="col-span-2 flex items-center justify-between sm:col-span-1 sm:flex-col sm:items-end sm:gap-5">
                  <p>{formatCurrency(item.price * item.quantity)}</p>
                  <div className="flex items-center border border-line"><button className="p-2" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Diminuir quantidade"><MinusIcon className="h-3.5 w-3.5" /></button><span className="w-8 text-center text-xs">{item.quantity}</span><button className="p-2" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Aumentar quantidade"><PlusIcon className="h-3.5 w-3.5" /></button></div>
                </div>
              </article>
            ))}
          </div>

          <section className="border border-line bg-white p-5 sm:p-7">
            <p className="eyebrow">Entrega</p>
            <h2 className="mt-3 font-serif text-3xl">Dados para receber seu pedido</h2>
            <p className="mt-3 text-sm leading-6 text-black/55">Frete grátis para todo o Brasil. Preencha os dados exatamente como devem constar na entrega.</p>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <Field label="Nome completo" value={customer.fullName} onChange={(value) => updateField("fullName", value)} autoComplete="name" className="sm:col-span-2" />
              <Field label="E-mail" type="email" value={customer.email} onChange={(value) => updateField("email", value)} autoComplete="email" />
              <Field label="Telefone com DDD" value={customer.phone} onChange={(value) => updateField("phone", value)} inputMode="tel" autoComplete="tel" />
              <Field label="CPF" value={customer.document} onChange={(value) => updateField("document", value)} inputMode="numeric" autoComplete="off" />
              <Field label="CEP" value={customer.zipCode} onChange={(value) => updateField("zipCode", value)} inputMode="numeric" autoComplete="postal-code" />
              <Field label="Rua / Avenida" value={customer.street} onChange={(value) => updateField("street", value)} autoComplete="address-line1" className="sm:col-span-2" />
              <Field label="Número" value={customer.number} onChange={(value) => updateField("number", value)} inputMode="numeric" />
              <Field label="Complemento (opcional)" value={customer.complement} onChange={(value) => updateField("complement", value)} autoComplete="address-line2" />
              <Field label="Bairro" value={customer.neighborhood} onChange={(value) => updateField("neighborhood", value)} />
              <Field label="Cidade" value={customer.city} onChange={(value) => updateField("city", value)} autoComplete="address-level2" />
              <Field label="UF" value={customer.state} onChange={(value) => updateField("state", value.toUpperCase().slice(0, 2))} autoComplete="address-level1" maxLength={2} />
            </div>
          </section>
        </div>

        <aside className="h-fit bg-ink p-7 text-white lg:sticky lg:top-32">
          <p className="eyebrow text-white/50">Resumo</p>
          <div className="mt-6 flex items-end justify-between border-b border-white/20 pb-5"><span className="text-xs uppercase tracking-[0.14em]">Subtotal</span><strong className="font-serif text-3xl font-normal">{formatCurrency(subtotal)}</strong></div>
          <div className="flex items-center justify-between border-b border-white/20 py-5 text-xs uppercase tracking-[0.14em]"><span>Frete</span><strong className="font-normal">Grátis</strong></div>
          <div className="mt-5 flex items-end justify-between"><span className="text-xs uppercase tracking-[0.14em]">Total</span><strong className="font-serif text-3xl font-normal">{formatCurrency(subtotal)}</strong></div>
          <p className="mt-5 text-xs leading-5 text-white/55">O endereço acima será vinculado ao pedido. A forma de pagamento é concluída com segurança no Mercado Pago.</p>
          <button className="button-light mt-7 w-full disabled:cursor-wait disabled:opacity-65" onClick={beginCheckout} disabled={checkoutState === "loading"}>{checkoutState === "loading" ? "Preparando pagamento..." : "Ir para o pagamento"}</button>
          {checkoutState === "error" && <p role="alert" className="mt-4 border border-white/25 p-3 text-xs leading-5 text-white/80">{checkoutError}</p>}
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  className = "",
  type = "text",
  inputMode,
  autoComplete,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  type?: string;
  inputMode?: "text" | "numeric" | "tel" | "email" | "decimal" | "search" | "url" | "none";
  autoComplete?: string;
  maxLength?: number;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-black/50">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode={inputMode}
        autoComplete={autoComplete}
        maxLength={maxLength}
        className="min-h-12 w-full border border-line bg-paper px-3 text-sm outline-none transition focus:border-ink"
      />
    </label>
  );
}
