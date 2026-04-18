import { useState } from 'react';
import ShoppingListPage from './pages/ShoppingListPage';
import PlaceholderPage from './pages/PlaceholderPage';
import './App.css';

type TabId = 'list' | 'tab2';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'list', label: 'Список', icon: '🛒' },
  { id: 'tab2', label: 'Скоро', icon: '✦' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('list');

  return (
    <div className="app-shell">
      <div className="page-container">
        {activeTab === 'list' && <ShoppingListPage />}
        {activeTab === 'tab2' && <PlaceholderPage icon="✨" label="Новый раздел" />}
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
