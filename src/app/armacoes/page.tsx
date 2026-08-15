import type { Metadata } from "next";
import { CollectionPage } from "@/components/collection-page";
import { getProductsByCategory } from "@/data/products";

export const metadata: Metadata = { title: "Armações", description: "Armações Verani Ferraro. Lentes de grau não inclusas." };
export default function Page() { return <CollectionPage eyebrow="Armações" title="Inteligência em perspectiva." description="Cinco armações visualmente distintas para acompanhar rotina, repertório e ambição com clareza." note="As peças são vendidas como armações. Lentes de grau não estão inclusas nesta versão da operação." products={getProductsByCategory("optical-frame")} heroImage="/images/lifestyle/women/optical-editorial.png" heroAlt="Mulher trabalhando com armação tartaruga Verani Ferraro" />; }
