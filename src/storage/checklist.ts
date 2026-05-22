const KEY = 'checklist_data';

export type ChecklistItem = { id: string; name: string; taken: boolean };
export type ChecklistCategory = { id: string; name: string; items: ChecklistItem[] };
export type Checklist = { categories: ChecklistCategory[] };

export function loadChecklist(): Checklist {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { categories: [] };
    return JSON.parse(raw);
  } catch {
    return { categories: [] };
  }
}

export function saveChecklist(data: Checklist): void {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function addCategory(list: Checklist, name: string): Checklist {
  const trimmed = name.trim();
  if (!trimmed) return list;
  return { categories: [...list.categories, { id: uid(), name: trimmed, items: [] }] };
}

export function removeCategory(list: Checklist, catId: string): Checklist {
  return { categories: list.categories.filter(c => c.id !== catId) };
}

export function addItem(list: Checklist, catId: string, name: string): Checklist {
  const trimmed = name.trim();
  if (!trimmed) return list;
  return {
    categories: list.categories.map(c =>
      c.id === catId
        ? { ...c, items: [...c.items, { id: uid(), name: trimmed, taken: false }] }
        : c,
    ),
  };
}

export function removeItem(list: Checklist, catId: string, itemId: string): Checklist {
  return {
    categories: list.categories.map(c =>
      c.id === catId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c,
    ),
  };
}

export function toggleItem(list: Checklist, catId: string, itemId: string): Checklist {
  return {
    categories: list.categories.map(c =>
      c.id === catId
        ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, taken: !i.taken } : i) }
        : c,
    ),
  };
}

export function resetAll(list: Checklist): Checklist {
  return {
    categories: list.categories.map(c => ({
      ...c,
      items: c.items.map(i => ({ ...i, taken: false })),
    })),
  };
}
