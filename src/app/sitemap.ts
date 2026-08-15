import type { MetadataRoute } from "next";
import { activeProducts } from "@/data/products";

export const dynamic = "force-static";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/colecao", "/relogios", "/oculos-de-sol", "/armacoes", "/kits", "/kits/executive-set", "/sobre", "/atendimento", "/politicas/trocas", "/politicas/privacidade", "/politicas/termos"];
  return [...routes.map((route) => ({ url: `${baseUrl}${route}`, lastModified: new Date(), changeFrequency: route === "" ? "weekly" as const : "monthly" as const, priority: route === "" ? 1 : 0.7 })), ...activeProducts.map((product) => ({ url: `${baseUrl}/produto/${product.slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 }))];
}
