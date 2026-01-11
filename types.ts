
export enum Role {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER'
}

export enum Category {
  DESKTOP = 'Desktop',
  LAPTOP = 'Laptop',
  PRINTER = 'Printer',
  ACCESSORIES = 'Accessories',
  DUKAN_SALE = 'Dukan Sale'
}

export enum SaleType {
  IN_STORE = 'In-Store (Dukan)',
  ONLINE = 'Online (App)'
}

export enum OrderStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  PACKED = 'Packed',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled'
}

export enum RepairStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  DELIVERED = 'Delivered'
}

export enum PaymentMethod {
  CASH = 'Cash',
  EASYPAISA = 'EasyPaisa',
  JAZZCASH = 'JazzCash',
  BANK_TRANSFER = 'Bank Transfer',
  COD = 'Cash on Delivery'
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  image: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  warranty: string;
  isAvailable: boolean;
  description: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  address: string;
  date: string;
  saleType: SaleType;
}

export interface Repair {
  id: string;
  customerName: string;
  mobile: string;
  deviceType: string;
  problem: string;
  estimatedCharges: number;
  cost: number; // My Kharcha (Expense)
  status: RepairStatus;
  deliveryDate: string;
  entryDate: string;
}

export interface ShopProfile {
  name: string;
  logo: string;
  address: string;
  mobile: string;
  whatsapp: string;
  mapsUrl: string;
  openingTime: string;
  closingTime: string;
}

export interface User {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  role: Role;
  address?: string;
}
