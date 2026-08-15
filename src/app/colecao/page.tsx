import type { Metadata } from "next";
import { CollectionPage } from "@/components/collection-page";
import { activeProducts } from "@/data/products";

export const metadata: Metadata = { title: "Coleção Inaugural", description: "Conheça a coleção inaugural Verani Ferraro de relógios, óculos de sol e armações." };

export default function Page() {
  return <CollectionPage eyebrow="Coleção" title="Coleção Inaugural" description="Uma seleção enxuta de relógios, óculos de sol e armações pensada para acompanhar uma presença segura, contemporânea e sem excessos." products={activeProducts.filter((product) => product.category !== "gift")} editorialFirst />;
}
