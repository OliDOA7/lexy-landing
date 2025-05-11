export interface Plan {
  id: string;
  name: string;
  price: string;
  priceFrequency: string;
  features: string[];
  cta: string;
  isPopular?: boolean;
  themeColor?: string; // hex color for special styling
}
