import { useState, useRef, useEffect } from 'react';
import { ShoppingList, ProductStatus } from './types';
import { loadList, saveList, addProduct, removeProduct, setProductStatus, clearBought, clearAll } from './storage';
import './App.css';

const STATUS_ICONS: Record<ProductStatus, string> = {
  pending: '⬜',
  bought: '✅',
  unavailable: '❌',
};

const STATUS_CYCLE: ProductStatus[] = ['pending', 'bought', 'unavailable'];

function App() {
  const [list, setList] = useState<ShoppingList>(loadList);
  const [input, setInput] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveList(list);
  }, [list]);

  const handleAdd = () => {
    const names = input.split(',').map(s => s.trim()).filter(Boolean);
    let updated = list;
    for (const name of names) {
      updated = addProduct(updated, name);
    }
    setList(updated);
    setInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  const cycleStatus = (productId: string, currentStatus: ProductStatus) => {
    const nextIndex = (STATUS_CYCLE.indexOf(currentStatus) + 1) % STATUS_CYCLE.length;
    setList(setProductStatus(list, productId, STATUS_CYCLE[nextIndex]));
  };

  const handleRemove = (productId: string) => {
    setList(removeProduct(list, productId));
  };

  const totalItems = list.categories.reduce((sum, c) => sum + c.items.length, 0);
  const boughtItems = list.categories.reduce(
    (sum, c) => sum + c.items.filter(i => i.status === 'bought').length, 0
  );

  return (
    <div className="app">
      <header className="header">
        <h1>Список покупок</h1>
        {totalItems > 0 && (
          <span className="counter">{boughtItems}/{totalItems}</span>
        )}
        <button
          className="menu-btn"
          onClick={() => setShowMenu(!showMenu)}
        >
          ⋮
        </button>
        {showMenu && (
          <div className="menu-dropdown">
            <button onClick={() => { setList(clearBought(list)); setShowMenu(false); }}>
              Убрать купленное
            </button>
            <button onClick={() => { setList(clearAll(list)); setShowMenu(false); }}>
              Очистить всё
            </button>
          </div>
        )}
      </header>

      <div className="input-row">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Добавить продукт (через запятую)..."
          autoComplete="off"
        />
        <button className="add-btn" onClick={handleAdd} disabled={!input.trim()}>
          +
        </button>
      </div>

      {list.categories.length === 0 && (
        <div className="empty">
          <p>Список пуст</p>
          <p className="hint">Введите продукты выше — они автоматически распределятся по категориям</p>
        </div>
      )}

      <div className="categories">
        {list.categories.map(cat => (
          <div key={cat.name} className="category">
            <h2 className="category-name">{cat.name}</h2>
            <ul>
              {cat.items.map(item => (
                <li
                  key={item.id}
                  className={`item item--${item.status}`}
                >
                  <button
                    className="status-btn"
                    onClick={() => cycleStatus(item.id, item.status)}
                  >
                    {STATUS_ICONS[item.status]}
                  </button>
                  <span className="item-name">{item.name}</span>
                  <button
                    className="delete-btn"
                    onClick={() => handleRemove(item.id)}
                  >
                    🗑
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
