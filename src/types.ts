export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_price?: number | null;
  image_url: string;
  category?: string;
  category_id?: string | number;
  stock: boolean | number;
  is_active?: boolean;
  created_at?: string;
  new_collection?: boolean;
  all_images?: string[];
  product_images?: {
    image_url: string;
    is_main?: boolean;
  }[];
  sizes?: Size[];
  colors?: Color[];
}

export interface Size {
  id: string | number;
  name: string;
}

export interface Color {
  id: string | number;
  name: string;
}

export interface Category {
  Id: string | number;
  name: string;
  created_at?: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface PromoCode {
  id?: number;
  promo_code: string;
  amount_of_discount_in_percent: number;
  status: boolean;
  Category_id?: number | null;
  category?: Category;
}

