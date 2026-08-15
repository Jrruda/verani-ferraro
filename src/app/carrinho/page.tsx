import type { Metadata } from "next";
import { CartPageContent } from "@/components/cart-page-content";

export const metadata: Metadata = { title: "Carrinho", robots: { index: false, follow: false } };
export default function Page() { return <main className="min-h-[70svh]"><CartPageContent /></main>; }
