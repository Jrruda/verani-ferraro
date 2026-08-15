import type { Metadata } from "next";
import { CollectionPage } from "@/components/collection-page";
import { getProductsByCategory } from "@/data/products";

export const metadata: Metadata = { title: "Óculos de Sol", description: "Óculos de sol Verani Ferraro da coleção inaugural." };
export default function Page() { return <CollectionPage eyebrow="Óculos de Sol" title="Enquadrar o olhar." description="Silhuetas marcantes e tons sóbrios para uma expressão visual que equilibra confiança e naturalidade." products={getProductsByCategory("sunglasses")} heroImage="/images/lifestyle/women/sunglasses-01-editorial.png" heroAlt="Mulher usando óculos de sol tartaruga Verani Ferraro" />; }
