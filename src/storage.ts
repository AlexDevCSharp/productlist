import { ShoppingList, Product, ProductStatus } from './types';
import { findCategory } from './categoryMap';

const STORAGE_KEY = 'productlist_data';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function loadList(): ShoppingList {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { categories: [], updatedAt: new Date().toISOString() };
}

export function saveList(list: ShoppingList): void {
  list.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function addProduct(list: ShoppingList, name: string): ShoppingList {
  const trimmed = name.trim();
  if (!trimmed) return list;

  const categoryName = findCategory(trimmed);
  const newList = { ...list, categories: [...list.categories] };

  let catIndex = newList.categories.findIndex(c => c.name === categoryName);
  if (catIndex === -1) {
    newList.categories.push({ name: categoryName, items: [] });
    catIndex = newList.categories.length - 1;
  } else {
    newList.categories[catIndex] = {
      ...newList.categories[catIndex],
      items: [...newList.categories[catIndex].items],
    };
  }

  const exists = newList.categories[catIndex].items.some(
    i => i.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (exists) return list;

  const product: Product = { id: generateId(), name: trimmed, status: 'pending' };
  newList.categories[catIndex].items.push(product);

  saveList(newList);
  return newList;
}

export function removeProduct(list: ShoppingList, productId: string): ShoppingList {
  const newList: ShoppingList = {
    ...list,
    categories: list.categories
      .map(cat => ({
        ...cat,
        items: cat.items.filter(item => item.id !== productId),
      }))
      .filter(cat => cat.items.length > 0),
  };
  saveList(newList);
  return newList;
}

export function setProductStatus(
  list: ShoppingList,
  productId: string,
  status: ProductStatus,
): ShoppingList {
  const newList: ShoppingList = {
    ...list,
    categories: list.categories.map(cat => ({
      ...cat,
      items: cat.items.map(item =>
        item.id === productId ? { ...item, status } : item
      ),
    })),
  };
  saveList(newList);
  return newList;
}

export function clearBought(list: ShoppingList): ShoppingList {
  const newList: ShoppingList = {
    ...list,
    categories: list.categories
      .map(cat => ({
        ...cat,
        items: cat.items.filter(item => item.status !== 'bought'),
      }))
      .filter(cat => cat.items.length > 0),
  };
  saveList(newList);
  return newList;
}

export function clearAll(_list: ShoppingList): ShoppingList {
  const newList: ShoppingList = { categories: [], updatedAt: '' };
  saveList(newList);
  return newList;
}
