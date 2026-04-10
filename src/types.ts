export type ProductStatus = 'pending' | 'bought' | 'unavailable';

export interface Product {
  id: string;
  name: string;
  status: ProductStatus;
}

export interface Category {
  name: string;
  items: Product[];
}

export interface ShoppingList {
  categories: Category[];
  updatedAt: string;
}
