import { useState, useRef, useEffect } from 'react';
import { ShoppingList, ProductStatus } from './types';
import { loadList, saveList, addProduct, removeProduct, setProductStatus, clearBought, clearAll } from './storage';
import './App.css';

const CATEGORY_EMOJI: Record<string, string> = {
  'Молочное': '🥛',
  'Мясо и птица': '🥩',
  'Рыба и морепродукты': '🐟',
  'Овощи': '🥬',
  'Фрукты и ягоды': '🍎',
  'Хлеб и выпечка': '🍞',
  'Крупы и макароны': '🌾',
  'Напитки': '🥤',
  'Бакалея': '🫙',
  'Яйца': '🥚',
  'Замороженное': '🧊',
  'Хозтовары': '🧹',
  'Другое': '📦',
};

function App() {
  const [list, setList] = useState<ShoppingList>(loadList);
  const [input, setInput] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    saveList(list);
  }, [list]);

  const handleAdd = () => {
    const names = input
      .split(/[\n,;]+/)
      .map(s => s.replace(/^[\d.\-)\s•·●○]+/, '').trim())
      .filter(s => s.length >= 2 && !/^(если|или|либо|по желанию|опционально)\b/i.test(s));
    let updated = list;
    for (const name of names) {
      updated = addProduct(updated, name);
    }
    setList(updated);
    setInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  };

  const toggleBought = (productId: string, currentStatus: ProductStatus) => {
    const next: ProductStatus = currentStatus === 'bought' ? 'pending' : 'bought';
    setList(setProductStatus(list, productId, next));
  };

  const toggleUnavailable = (productId: string, currentStatus: ProductStatus) => {
    const next: ProductStatus = currentStatus === 'unavailable' ? 'pending' : 'unavailable';
    setList(setProductStatus(list, productId, next));
  };

  const handleRemove = (productId: string) => {
    setList(removeProduct(list, productId));
  };

  const totalItems = list.categories.reduce((sum, c) => sum + c.items.length, 0);
  const boughtItems = list.categories.reduce(
    (sum, c) => sum + c.items.filter(i => i.status === 'bought').length, 0
  );
  const totalCategories = list.categories.length;

  return (
    <div className="app">
      <header className="header">
        <div className="header-icon">🛒</div>
        <h1>Список покупок</h1>
        {totalItems > 0 && (
          <div className="stats">
            {boughtItems}/{totalItems} куплено · {totalCategories} отделов
          </div>
        )}
        <button
          className="menu-btn"
          onClick={() => setShowMenu(!showMenu)}
        >
          ⋮
        </button>
        {showMenu && (
          <>
            <div className="menu-overlay" onClick={() => setShowMenu(false)} />
            <div className="menu-dropdown">
              <button onClick={() => { setList(clearBought(list)); setShowMenu(false); }}>
                ✅ Убрать купленное
              </button>
              <button onClick={() => { setList(clearAll(list)); setShowMenu(false); }}>
                🗑️ Очистить всё
              </button>
            </div>
          </>
        )}
      </header>

      <div className="input-row">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={"Вставьте список:\nмолоко\nхлеб\nкурица"}
          rows={input.includes('\n') ? Math.min(input.split('\n').length + 1, 8) : 1}
        />
        <button className="add-btn" onClick={handleAdd} disabled={!input.trim()}>
          +
        </button>
      </div>

      {list.categories.length === 0 && (
        <div className="empty">
          <div className="empty-icon">🛒</div>
          <p>Список пуст</p>
          <p className="hint">Введите продукты — они автоматически распределятся по категориям</p>
        </div>
      )}

      <div className="categories">
        {list.categories.map(cat => {
          const emoji = CATEGORY_EMOJI[cat.name] || '📦';
          const catBought = cat.items.filter(i => i.status === 'bought').length;
          return (
            <div key={cat.name} className="category">
              <div className="category-header">
                <span className="category-emoji">{emoji}</span>
                <h2 className="category-name">{cat.name}</h2>
                <span className="category-count">
                  {catBought > 0 && <span className="category-bought">{catBought}/</span>}
                  {cat.items.length} шт
                </span>
              </div>
              <ul>
                {cat.items.map(item => (
                  <li
                    key={item.id}
                    className={`item item--${item.status}`}
                  >
                    <label className="checkbox" onClick={() => toggleBought(item.id, item.status)}>
                      <span className={`checkbox-box ${item.status === 'bought' ? 'checked' : ''}`}>
                        {item.status === 'bought' && '✓'}
                      </span>
                    </label>
                    <span className="item-name">{item.name}</span>
                    <div className="item-actions">
                      <button
                        className={`unavailable-btn ${item.status === 'unavailable' ? 'active' : ''}`}
                        onClick={() => toggleUnavailable(item.id, item.status)}
                        title="Нет в наличии"
                      >
                        ✕
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleRemove(item.id)}
                        title="Удалить"
                      >
                        🗑
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
