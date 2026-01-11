
import React from 'react';

export const INITIAL_SHOP_PROFILE = {
  name: "PakTech Computers",
  logo: "https://picsum.photos/seed/shop/200/200",
  address: "Shop #4, Al-Hafeez Center, Gulberg III, Lahore, Pakistan",
  mobile: "0300-1234567",
  whatsapp: "923001234567",
  mapsUrl: "https://goo.gl/maps/example",
  openingTime: "10:00 AM",
  closingTime: "09:00 PM"
};

export const INITIAL_PRODUCTS = [
  {
    id: '1',
    name: 'Dell Latitude 7490',
    category: 'Laptop' as any,
    image: 'https://picsum.photos/seed/dell/400/300',
    buyPrice: 45000,
    sellPrice: 52000,
    stock: 12,
    warranty: '6 Months',
    isAvailable: true,
    description: 'Core i7 8th Gen, 16GB RAM, 256GB SSD'
  },
  {
    id: '2',
    name: 'HP EliteDesk 800 G3',
    category: 'Desktop' as any,
    image: 'https://picsum.photos/seed/hp/400/300',
    buyPrice: 28000,
    sellPrice: 35000,
    stock: 4,
    warranty: '1 Year',
    isAvailable: true,
    description: 'Core i5 7th Gen, 8GB RAM, 500GB HDD'
  },
  {
    id: '3',
    name: 'Logitech G102 Mouse',
    category: 'Accessories' as any,
    image: 'https://picsum.photos/seed/mouse/400/300',
    buyPrice: 3200,
    sellPrice: 4500,
    stock: 25,
    warranty: 'Local Warranty',
    isAvailable: true,
    description: 'Gaming RGB Mouse, 8000 DPI'
  }
];

export const CATEGORIES = ['Desktop', 'Laptop', 'Printer', 'Accessories', 'Dukan Sale'];
