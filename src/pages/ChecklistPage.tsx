import { useEffect, useState } from 'react';
import {
  Checklist,
  loadChecklist,
  saveChecklist,
  addCategory,
  removeCategory,
  addItem,
  removeItem,
  toggleItem,
  resetAll,
} from '../storage/checklist';

export default function ChecklistPage() {
  const [data, setData] = useState<Checklist>(loadChecklist);
  const [newCat, setNewCat] = useState('');
  const [itemInputs, setItemInputs] = useState<Record<string, string>>({});
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    saveChecklist(data);
  }, [data]);

  const total = data.categories.reduce((s, c) => s + c.items.length, 0);
  const taken = data.categories.reduce(
    (s, c) => s + c.items.filter(i => i.taken).length,
    0,
  );

  const handleAddCategory = () => {
    if (!newCat.trim()) return;
    setData(addCategory(data, newCat));
    setNewCat('');
  };

  const handleAddItem = (catId: string) => {
    const name = itemInputs[catId];
    if (!name?.trim()) return;
    setData(addItem(data, catId, name));
    setItemInputs({ ...itemInputs, [catId]: '' });
  };

  const handleRemoveCategory = (catId: string, catName: string, hasItems: boolean) => {
    if (hasItems && !confirm(`Удалить категорию «${catName}» со всеми вещами?`)) return;
    setData(removeCategory(data, catId));
  };

  return (
    <div className="page">
      <header className="header">
        <div className="header-top">
          <div className="header-icon">🎒</div>
          <h1>Чеклист</h1>
          {total > 0 && (
            <div className="stats">
              {taken}/{total} собрано · {data.categories.length} категорий
            </div>
          )}
        </div>
        <button className="menu-btn" onClick={() => setShowMenu(!showMenu)}>⋮</button>
        {showMenu && (
          <>
            <div className="menu-overlay" onClick={() => setShowMenu(false)} />
            <div className="menu-dropdown">
              <button onClick={() => { setData(resetAll(data)); setShowMenu(false); }}>
                🔄 Сбросить отметки
              </button>
            </div>
          </>
        )}
      </header>

      <div className="input-row">
        <textarea
          value={newCat}
          onChange={e => setNewCat(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleAddCategory();
            }
          }}
          placeholder="Новая категория (например: Документы, Одежда)"
          rows={1}
        />
        <button
          className="add-btn"
          onClick={handleAddCategory}
          disabled={!newCat.trim()}
        >+</button>
      </div>

      {data.categories.length === 0 && (
        <div className="empty">
          <div className="empty-icon">🎒</div>
          <p>Чеклист пуст</p>
          <p className="hint">
            Создайте категорию (например, «Документы», «Одежда») и добавляйте в неё вещи
          </p>
        </div>
      )}

      <div className="categories">
        {data.categories.map(cat => {
          const catTaken = cat.items.filter(i => i.taken).length;
          return (
            <div key={cat.id} className="category">
              <div className="category-header">
                <span className="category-emoji">📁</span>
                <h2 className="category-name">{cat.name}</h2>
                <span className="category-count">
                  {catTaken > 0 && <span className="category-bought">{catTaken}/</span>}
                  {cat.items.length} шт
                </span>
                <button
                  className="cl-cat-delete"
                  onClick={() => handleRemoveCategory(cat.id, cat.name, cat.items.length > 0)}
                  title="Удалить категорию"
                >🗑</button>
              </div>

              <div className="cl-add-row">
                <input
                  type="text"
                  value={itemInputs[cat.id] || ''}
                  onChange={e => setItemInputs({ ...itemInputs, [cat.id]: e.target.value })}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddItem(cat.id);
                    }
                  }}
                  placeholder="Добавить вещь…"
                />
                <button
                  className="cl-add-item"
                  onClick={() => handleAddItem(cat.id)}
                  disabled={!itemInputs[cat.id]?.trim()}
                >+</button>
              </div>

              <ul>
                {cat.items.map(item => (
                  <li key={item.id} className={`item ${item.taken ? 'item--bought' : ''}`}>
                    <label
                      className="checkbox"
                      onClick={() => setData(toggleItem(data, cat.id, item.id))}
                    >
                      <span className={`checkbox-box ${item.taken ? 'checked' : ''}`}>
                        {item.taken && '✓'}
                      </span>
                    </label>
                    <span className="item-name">{item.name}</span>
                    <div className="item-actions">
                      <button
                        className="delete-btn"
                        onClick={() => setData(removeItem(data, cat.id, item.id))}
                        title="Удалить"
                      >🗑</button>
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
