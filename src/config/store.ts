export const storeConfig = {
  brand: {
    name: "Verani Ferraro",
    legalOriginClaim: "Marca brasileira com inspiração estética italiana.",
  },
  announcement: {
    enabled: true,
    label: "Coleção inaugural — The Executive Set por R$197",
    href: "/kits/executive-set",
  },
  catalogPrices: {
    watch: 149,
    sunglasses: 129,
    opticalFrame: 119,
  },
  offer: {
    name: "The Executive Set",
    price: 197,
    currency: "BRL",
  },
  executiveSet: {
    enabled: true,
    includedGift: {
      enabled: true,
      productId: "gift-leather-case-01",
      quantity: 1,
      price: 0,
      label: "Brinde da Coleção Inaugural",
    },
    additionalGifts: [
      { quantity: 1, price: 15, enabled: false },
      { quantity: 2, price: 25, enabled: false },
    ],
  },
  freeShipping: {
    enabled: false,
    label: "Frete grátis para todo Brasil",
  },
  installments: {
    enabled: false,
    installments: 6,
  },
  exchanges: {
    enabled: false,
    days: 7,
  },
  warranty: {
    enabled: false,
    days: 90,
  },
  socialLinks: {
    instagram: "",
  },
  contact: {
    email: "",
    whatsapp: "",
  },
  analytics: {
    gaId: process.env.NEXT_PUBLIC_GA_ID ?? "",
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "",
  },
  checkout: {
    provider: "mercado-pago",
    enabled: false,
  },
} as const;
