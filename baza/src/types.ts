/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Category {
  Id?: number; // Capital Id as shown in the DB schema for categories
  id?: number; // fallback
  name: string;
}

export interface Size {
  id: number;
  name: string;
  sort_order: number;
}

export interface Color {
  id: number;
  Color?: string; // DB schema has capital "Color" as text column
  color?: string; // lowercase fallback
  name?: string;  // generic fallback
}

export interface Product {
  id?: number;
  created_at?: string;
  name: string;
  description: string;
  price: number;
  discount_price: number | null;
  stock: boolean;
  is_active: boolean;
  category_id: number | null;
  new_collection: boolean;
  
  // Joins/related info (optional)
  category?: Category;
  images?: ProductImage[];
  sizes?: Size[];
  colors?: Color[];
}

export interface ProductImage {
  id?: number;
  product_id?: number;
  image_url: string;
  is_main: boolean;
  image_url2?: string | null;
  image_url3?: string | null;
  image_url4?: string | null;
  image_url5?: string | null;
  image_url6?: string | null;
}

export interface ProductSize {
  id?: number;
  product_id: number;
  size_id: number;
}

export interface ProductColor {
  id?: number;
  product_id: number;
  color_id: number;
}

export interface Order {
  id: number;
  created_at?: string;
  order_number: string;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: number;
  total_price: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  size_id: number | null;
  color_id: number | null;
  quantity: number;
  price: number;
  product?: Product;
  size?: Size;
  color?: Color;
}

export interface PromoCode {
  id?: number;
  promo_code: string;
  amount_of_discount_in_percent: number;
  status: boolean;
  Category_id?: number | null;
  category?: Category;
}


