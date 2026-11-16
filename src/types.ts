export type ScreenId =
  | 'home'
  | 'pos'
  | 'categories'
  | 'inventory'
  | 'clients'
  | 'khata'
  | 'charts'
  | 'orders';

export type PlatformId = 'dukaan' | 'web' | 'delivery' | 'whatsapp';

export type PaymentMethod = 'cash' | 'card' | 'qr' | 'udhaar';

export type ProductVisualKey =
  | 'atta'
  | 'rice'
  | 'daal'
  | 'oil'
  | 'sugar'
  | 'tea'
  | 'salt'
  | 'milk'
  | 'eggs'
  | 'butter'
  | 'biscuits'
  | 'soda'
  | 'chips'
  | 'detergent'
  | 'soap'
  | 'spices';

export interface CategoryNode {
  id: string;
  name: string;
  urduName: string;
  parentId: string | null;
  colorHex: string;
  imageUrl?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  urduName: string;
  unit: string;
  categoryId: string;
  price: number;
  stock: number;
  visualKey: ProductVisualKey;
  imageUrl?: string;
  platforms: PlatformId[];
}

export interface Client {
  id: string;
  serialNo: number;
  name: string;
  urduName: string;
  phone: string;
  address: string;
  udhaarBalance: number;
  udhaarSince: string | null;
  colorHex: string;
  imageUrl?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  urduName: string;
  unit: string;
  price: number;
  qty: number;
  visualKey: ProductVisualKey;
  imageUrl?: string;
}

export interface Order {
  id: string;
  orderNo: number;
  createdAt: string;
  platform: PlatformId;
  paymentMethod: PaymentMethod;
  clientId: string | null;
  items: OrderItem[];
  total: number;
}

export interface CustomShortcut {
  id: string;
  name: string;
  urduName: string;
  targetScreen: ScreenId;
  categoryId?: string;
  colorHex: string;
  imageUrl?: string;
}
