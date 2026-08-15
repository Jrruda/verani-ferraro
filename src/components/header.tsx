"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { activeProducts } from "@/data/products";
import { storeConfig } from "@/config/store";
import { BagIcon, CloseIcon, MenuIcon, SearchIcon } from "@/components/icons";
import { useCart } from "@/components/cart-provider";
import { CartDrawer } from "@/components/cart-drawer";
import { formatCurrency } from "@/lib/format";

const navigation = [
  { label: "Coleção", href: "/colecao" },
  { label: "Relógios", href: "/relogios" },
  { label: "Óculos de Sol", href: "/oculos-de-sol" },
  { label: "Armações", href: "/armacoes" },
  { label: "Kits", href: "/kits" },
];

export function Header() {
  const pathname = usePathname();
  const { count, setDrawerOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen && !searchOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, searchOpen]);

  return (
    <>
      {storeConfig.announcement.enabled && (
        <Link href={storeConfig.announcement.href} className="block bg-ink px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-white sm:text-xs">
          {storeConfig.announcement.label}
        </Link>
      )}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-paper/95 backdrop-blur-md">
        <div className="mx-auto grid h-[72px] max-w-page grid-cols-[1fr_auto_1fr] items-center px-5 sm:px-8 lg:h-20 lg:px-12">
          <button className="icon-button justify-self-start lg:hidden" aria-label="Abrir menu" onClick={() => setMenuOpen(true)}><MenuIcon /></button>
          <nav className="hidden items-center gap-6 lg:flex xl:gap-8" aria-label="Navegação principal">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className={`nav-link ${pathname === item.href ? "nav-link-active" : ""}`}>{item.label}</Link>
            ))}
          </nav>

          <Link href="/" className="justify-self-center text-center" aria-label="Verani Ferraro — página inicial">
            <span className="block text-[13px] font-semibold leading-none tracking-brand sm:text-[15px]">VERANI FERRARO</span>
            <span className="mt-1.5 hidden text-[8px] uppercase tracking-[0.34em] text-black/50 sm:block">Coleção inaugural</span>
          </Link>

          <div className="flex items-center justify-self-end gap-1.5 sm:gap-3">
            <button className="icon-button hidden sm:grid" aria-label="Buscar" onClick={() => setSearchOpen(true)}><SearchIcon /></button>
            <button className="icon-button relative" aria-label={`Abrir carrinho com ${count} ${count === 1 ? "item" : "itens"}`} onClick={() => setDrawerOpen(true)}>
              <BagIcon />
              {count > 0 && <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[9px] text-white">{count}</span>}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[70] bg-paper lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="flex h-[72px] items-center justify-between border-b border-line px-5">
            <span className="text-xs font-semibold tracking-brand">VERANI FERRARO</span>
            <button className="icon-button" onClick={() => setMenuOpen(false)} aria-label="Fechar menu"><CloseIcon /></button>
          </div>
          <nav className="px-6 py-8" aria-label="Menu mobile">
            <button className="mb-8 flex w-full items-center gap-3 border-b border-ink py-3 text-left text-sm" onClick={() => { setMenuOpen(false); setSearchOpen(true); }}><SearchIcon className="h-5 w-5" /> Buscar na coleção</button>
            {navigation.map((item, index) => (
              <Link key={item.href} href={item.href} className="flex items-baseline justify-between border-b border-line py-5 font-serif text-3xl">
                {item.label}<span className="font-sans text-[10px] tracking-[0.16em] text-black/45">0{index + 1}</span>
              </Link>
            ))}
            <Link href="/sobre" className="mt-8 inline-block text-xs uppercase tracking-[0.16em] underline underline-offset-4">Sobre a Verani Ferraro</Link>
          </nav>
        </div>
      )}

      {searchOpen && <SearchPanel onClose={() => setSearchOpen(false)} />}
      <CartDrawer />
    </>
  );
}

function SearchPanel({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => inputRef.current?.focus(), []);
  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    if (!normalized) return activeProducts.filter((product) => product.category !== "gift").slice(0, 5);
    return activeProducts.filter((product) => `${product.name} ${product.categoryLabel} ${product.colors?.join(" ")}`.toLocaleLowerCase("pt-BR").includes(normalized));
  }, [query]);

  return (
    <div className="fixed inset-0 z-[75] bg-paper" role="dialog" aria-modal="true" aria-labelledby="search-title">
      <div className="mx-auto max-w-4xl px-5 py-6 sm:px-8 sm:py-10">
        <div className="flex items-center justify-between">
          <p id="search-title" className="eyebrow">Buscar na coleção</p>
          <button className="icon-button" onClick={onClose} aria-label="Fechar busca"><CloseIcon /></button>
        </div>
        <label className="mt-10 flex items-center gap-4 border-b border-ink pb-3 sm:mt-16">
          <SearchIcon className="h-6 w-6 shrink-0" />
          <span className="sr-only">Buscar produto</span>
          <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Relógios, óculos, armações..." className="w-full bg-transparent font-serif text-2xl outline-none placeholder:text-black/35 sm:text-4xl" />
        </label>
        <div className="mt-8 divide-y divide-line">
          {results.length ? results.map((product) => (
            <Link key={product.id} href={`/produto/${product.slug}`} className="grid grid-cols-[72px_1fr_auto] items-center gap-4 py-4 group">
              <div className="relative aspect-square bg-white"><Image src={product.images.main} alt="" fill sizes="72px" className="object-contain p-1" /></div>
              <div><p className="text-xs uppercase tracking-[0.12em] text-black/45">{product.categoryLabel}</p><p className="mt-1 font-serif text-xl">{product.name}</p><p className="mt-1 text-xs text-black/55">{product.price !== undefined ? formatCurrency(product.price) : ""}</p></div>
              <span className="text-xs uppercase tracking-[0.14em] underline-offset-4 group-hover:underline">Ver peça</span>
            </Link>
          )) : <p className="py-12 text-center text-sm text-black/55">Nenhuma peça encontrada para “{query}”.</p>}
        </div>
      </div>
    </div>
  );
}
