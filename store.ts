
import { Product, Order, Repair, ShopProfile, User, Role } from './types';
import { INITIAL_SHOP_PROFILE, INITIAL_PRODUCTS } from './constants';

const STORAGE_KEY = 'paktech_store';

interface StoreState {
  shop: ShopProfile;
  products: Product[];
  orders: Order[];
  repairs: Repair[];
  users: User[];
  currentUser: User | null;
}

export const getStore = (): StoreState => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) return JSON.parse(data);
  return {
    shop: INITIAL_SHOP_PROFILE,
    products: INITIAL_PRODUCTS,
    orders: [],
    repairs: [],
    users: [],
    currentUser: null
  };
};

export const saveStore = (state: StoreState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};
