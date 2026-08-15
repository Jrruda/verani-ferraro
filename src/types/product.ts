export type ProductCategory = "watch" | "sunglasses" | "optical-frame" | "gift";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  categoryLabel: string;
  price?: number;
  description?: string;
  images: {
    main: string;
    front?: string;
    gallery?: string[];
    lifestyle?: string[];
  };
  colors?: string[];
  materials?: string[];
  dimensions?: Record<string, string>;
  active: boolean;
  featured?: boolean;
  eligibleForExecutiveSet?: boolean;
  includesPrescriptionLenses?: boolean;
};
