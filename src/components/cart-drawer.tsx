"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/components/cart-provider";
import { CloseIcon, MinusIcon, PlusIcon } from "@/components/icons";

export function CartDrawer() {
  const { items, subtotal, drawerOpen, setDrawerOpen, updateQuantity, removeItem } = useCart();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!drawerOpen) return;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen, setDrawerOpen]);

  if (!drawerOpen) return null;

  return (
    <div className="fixed inset-0 z-[80]" aria-live="polite">
      <button
        className="absolute inset-0 bg-black/45"
        aria-label="Fechar carrinho"
        onClick={() => setDrawerOpen(false)}
      />
      <aside
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-paper shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <div>
            <p className="eyebrow">Sua seleção</p>
            <h2 id="cart-title" className="mt-1 font-serif text-2xl">Carrinho</h2>
          </div>
          <button ref={closeButtonRef} className="icon-button" onClick={() => setDrawerOpen(false)} aria-label="Fechar carrinho">
            <CloseIcon />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <p className="font-serif text-3xl">Sua seleção começa aqui.</p>
            <p className="mt-3 max-w-xs text-sm leading-6 text-black/60">Explore a coleção inaugural ou construa seu Executive Set.</p>
            <Link href="/colecao" className="button-dark mt-7" onClick={() => setDrawerOpen(false)}>Conhecer a coleção</Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.map((item) => (
                <article key={item.id} className="grid grid-cols-[84px_1fr] gap-4 border-b border-line py-5">
                  <div className="relative aspect-square bg-white">
                    <Image src={item.image} alt="" fill sizes="84px" className="object-contain p-2" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.08em]">{item.name}</h3>
                        {item.details && <p className="mt-1 text-xs leading-5 text-black/55">{item.details}</p>}
                        {item.complimentaryItem && <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-black/55">{item.complimentaryItem.name} · {item.complimentaryItem.label} · {formatCurrency(item.complimentaryItem.price)}</p>}
                      </div>
                      <p className="whitespace-nowrap text-sm">{formatCurrency(item.price)}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center border border-line" aria-label={`Quantidade de ${item.name}`}>
                        <button className="p-2" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Diminuir quantidade"><MinusIcon className="h-3.5 w-3.5" /></button>
                        <span className="w-7 text-center text-xs">{item.quantity}</span>
                        <button className="p-2" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Aumentar quantidade"><PlusIcon className="h-3.5 w-3.5" /></button>
                      </div>
                      <button className="text-xs underline underline-offset-4" onClick={() => removeItem(item.id)}>Remover</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="border-t border-line bg-white px-6 py-6">
              <div className="flex items-end justify-between">
                <span className="text-xs uppercase tracking-[0.16em]">Subtotal</span>
                <strong className="font-serif text-2xl font-normal">{formatCurrency(subtotal)}</strong>
              </div>
              <p className="mt-2 text-xs leading-5 text-black/55">Frete, endereço e pagamento serão confirmados na finalização da compra.</p>
              <Link href="/carrinho" className="button-dark mt-5 w-full" onClick={() => setDrawerOpen(false)}>Revisar carrinho</Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
