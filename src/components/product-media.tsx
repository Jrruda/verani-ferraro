"use client";

import Image from "next/image";
import { useRef, useState, type PointerEvent } from "react";
import type { Product } from "@/types/product";

type ProductMediaProps = {
  product: Product;
  priority?: boolean;
  sizes: string;
  className?: string;
};

export function ProductMedia({ product, priority = false, sizes, className = "" }: ProductMediaProps) {
  const front = product.images.front;
  const hasDistinctFront = Boolean(front && front !== product.images.main);
  const [active, setActive] = useState<0 | 1>(0);
  const gesture = useRef<{ x: number; y: number } | null>(null);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!hasDistinctFront || event.pointerType === "mouse") return;
    gesture.current = { x: event.clientX, y: event.clientY };
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!gesture.current || event.pointerType === "mouse") return;
    const deltaX = event.clientX - gesture.current.x;
    const deltaY = event.clientY - gesture.current.y;
    gesture.current = null;
    if (Math.abs(deltaX) < 34 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.25) return;
    setActive(deltaX < 0 ? 1 : 0);
    event.preventDefault();
  }

  return (
    <div
      className={`product-media relative h-full w-full touch-pan-y bg-white ${hasDistinctFront ? "product-media-has-front" : ""} ${className}`}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => { gesture.current = null; }}
    >
      <Image
        src={product.images.main}
        alt={`${product.name} — vista diagonal`}
        fill
        priority={priority}
        sizes={sizes}
        className={`product-media-main object-contain p-[8%] transition-opacity duration-200 ease-quiet ${active === 1 ? "opacity-0" : "opacity-100"}`}
      />
      {hasDistinctFront && (
        <Image
          src={front!}
          alt={`${product.name} — vista frontal`}
          fill
          sizes={sizes}
          className={`product-media-front object-contain p-[8%] transition-opacity duration-200 ease-quiet ${active === 1 ? "opacity-100" : "opacity-0"}`}
        />
      )}
      {hasDistinctFront && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5 md:hidden" aria-hidden="true">
          <span className={`h-1 w-1 rounded-full ${active === 0 ? "bg-ink" : "bg-black/20"}`} />
          <span className={`h-1 w-1 rounded-full ${active === 1 ? "bg-ink" : "bg-black/20"}`} />
        </div>
      )}
    </div>
  );
}
