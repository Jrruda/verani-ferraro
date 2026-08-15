import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AnalyticsScripts } from "@/components/analytics-scripts";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Verani Ferraro — Autoridade não se pede. Se veste.",
    template: "%s | Verani Ferraro",
  },
  description: "Relógios e óculos selecionados para a imagem de quem está construindo algo maior.",
  applicationName: "Verani Ferraro",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Verani Ferraro",
    title: "Verani Ferraro — Autoridade não se pede. Se veste.",
    description: "Acessórios para a imagem de quem está construindo algo maior.",
    images: [{ url: "/images/lifestyle/women/hero-verani-desktop.png", width: 1536, height: 1024, alt: "Verani Ferraro" }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B0B0B",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Verani Ferraro",
    url: siteUrl,
    description: "Marca brasileira de acessórios com inspiração estética italiana, clássica e executiva.",
  };

  return (
    <html lang="pt-BR">
      <body className="min-h-screen antialiased">
        <a href="#conteudo" className="fixed left-3 top-3 z-[100] -translate-y-20 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-transform focus:translate-y-0">Pular para o conteúdo</a>
        <CartProvider>
          <Header />
          <div id="conteudo">{children}</div>
          <Footer />
        </CartProvider>
        <AnalyticsScripts />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c") }} />
      </body>
    </html>
  );
}
