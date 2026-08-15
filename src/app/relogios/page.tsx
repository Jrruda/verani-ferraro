import type { Metadata } from "next";
import { CollectionPage } from "@/components/collection-page";
import { getProductsByCategory } from "@/data/products";

export const metadata: Metadata = { title: "Relógios", description: "Relógios Verani Ferraro da coleção inaugural." };
export default function Page() { return <CollectionPage eyebrow="Relógios" title="O tempo como assinatura." description="Mostradores limpos e proporções clássicas em quatro interpretações escolhidas para compor presença com discrição." products={getProductsByCategory("watch")} heroImage="/images/lifestyle/details/watch-02-editorial.png" heroAlt="Relógio dourado Verani Ferraro em uma mesa de reunião" />; }
