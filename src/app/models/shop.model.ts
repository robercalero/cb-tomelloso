export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: number;
  categoryId: number | null;
  category: ProductCategory | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  comparePrice: number | null;
  images: string[] | null;
  sizes: string[] | null;
  colors: ProductColor[] | null;
  stock: number;
  sku: string | null;
  isActive: boolean;
  isFeatured: boolean;
  season: string | null;
  tags: string[] | null;
  createdAt: string;
}

export interface CartItem {
  id: number;
  sessionId: string;
  userId: number | null;
  productId: number;
  product: Product;
  quantity: number;
  size: string | null;
  color: string | null;
  addedAt: string;
}

export interface OrderItem {
  id: number;
  productId: number | null;
  productName: string;
  productSku: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  imageUrl: string | null;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number | null;
  sessionId: string | null;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  totalAmount: number;
  shippingName: string;
  shippingEmail: string;
  shippingPhone: string | null;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  notes: string | null;
  items: OrderItem[];
  paidAt: string | null;
  shippedAt: string | null;
  trackingNumber: string | null;
  createdAt: string;
}

export interface CheckoutForm {
  shippingName: string;
  shippingEmail: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  notes: string;
}
