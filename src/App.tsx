import { useState } from 'react';
import ShoppingListPage from './pages/ShoppingListPage';
import WorkoutPage from './pages/WorkoutPage';
import ChecklistPage from './pages/ChecklistPage';
import MoviesPage from './pages/MoviesPage';
import './App.css';

type TabId = 'list' | 'workout' | 'checklist' | 'movies';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'list',      label: 'Список',     icon: '🛒' },
  { id: 'workout',   label: 'Тренировки', icon: '💪' },
  { id: 'checklist', label: 'Чеклист',    icon: '🎒' },
  { id: 'movies',    label: 'Фильмы',     icon: '🎬' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('list');

  return (
    <div className="app-shell">
      <div className="page-container">
        {activeTab === 'list'      && <ShoppingListPage />}
        {activeTab === 'workout'   && <WorkoutPage />}
        {activeTab === 'checklist' && <ChecklistPage />}
        {activeTab === 'movies'    && <MoviesPage />}
      </div>

      <nav className="tab-bar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? 'tab-item--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
