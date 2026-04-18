import { useState } from 'react';
import ShoppingListPage from './pages/ShoppingListPage';
import WorkoutPage from './pages/WorkoutPage';
import './App.css';

type TabId = 'list' | 'workout';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'list',    label: 'Список',      icon: '🛒' },
  { id: 'workout', label: 'Тренировки',  icon: '💪' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('list');

  return (
    <div className="app-shell">
      <div className="page-container">
        {activeTab === 'list'    && <ShoppingListPage />}
        {activeTab === 'workout' && <WorkoutPage />}
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
