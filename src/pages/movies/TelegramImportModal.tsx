import { useState, useMemo } from 'react';
import { MovieCandidate } from '../../storage/telegramImport';
import { MovieInput } from '../../storage/movies';

interface Props {
  candidates: MovieCandidate[];
  existingUrls: Set<string>;
  onImport: (movies: MovieInput[]) => void;
  onClose: () => void;
}

export default function TelegramImportModal({ candidates, existingUrls, onImport, onClose }: Props) {
  // Pre-select everything that isn't already imported (by URL).
  const initialSelected = useMemo(() => {
    const s = new Set<string>();
    for (const c of candidates) if (!existingUrls.has(c.url)) s.add(c.id);
    return s;
  }, [candidates, existingUrls]);

  const [selected, setSelected] = useState<Set<string>>(initialSelected);
  const [titles, setTitles] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    for (const c of candidates) m[c.id] = c.title;
    return m;
  });

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const selectAll = () => setSelected(new Set(candidates.map(c => c.id)));
  const selectNone = () => setSelected(new Set());
  const selectNew = () => {
    const s = new Set<string>();
    for (const c of candidates) if (!existingUrls.has(c.url)) s.add(c.id);
    setSelected(s);
  };

  const handleImport = () => {
    const now = new Date().getFullYear();
    const movies: MovieInput[] = candidates
      .filter(c => selected.has(c.id))
      .map(c => ({
        title: (titles[c.id] || c.title).trim() || 'Без названия',
        url: c.url,
        poster: '',
        description: undefined,
        genre: 'Другое',
        year: c.year ?? now,
        status: 'unwatched',
        rating: undefined,
        notes: c.notes || undefined,
      }));
    onImport(movies);
  };

  const dupCount = candidates.filter(c => existingUrls.has(c.url)).length;

  return (
    <div className="mv-backdrop" onClick={onClose}>
      <div className="mv-modal tg-modal" onClick={e => e.stopPropagation()}>
        <div className="mv-modal-header">
          <h2>Импорт из Telegram — {candidates.length}</h2>
          <button className="mv-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="tg-toolbar">
          <div className="tg-toolbar-info">
            Выбрано: <strong>{selected.size}</strong>
            {dupCount > 0 && <span className="tg-dup"> · уже в списке: {dupCount}</span>}
          </div>
          <div className="tg-toolbar-actions">
            <button className="tg-mini" onClick={selectAll}>Все</button>
            <button className="tg-mini" onClick={selectNew}>Только новые</button>
            <button className="tg-mini" onClick={selectNone}>Ничего</button>
          </div>
        </div>

        <div className="tg-list">
          {candidates.map(c => {
            const isDup = existingUrls.has(c.url);
            const isSel = selected.has(c.id);
            return (
              <label key={c.id} className={`tg-item ${isSel ? 'tg-item--sel' : ''} ${isDup ? 'tg-item--dup' : ''}`}>
                <input
                  type="checkbox"
                  checked={isSel}
                  onChange={() => toggle(c.id)}
                />
                <div className="tg-item-body">
                  <input
                    type="text"
                    className="tg-item-title"
                    value={titles[c.id] ?? c.title}
                    onChange={e => setTitles({ ...titles, [c.id]: e.target.value })}
                    onClick={e => e.stopPropagation()}
                  />
                  <div className="tg-item-meta">
                    {c.year && <span className="tg-year">{c.year}</span>}
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="tg-item-url"
                    >
                      {c.url}
                    </a>
                    {c.extraUrls.length > 0 && (
                      <span className="tg-extra">+{c.extraUrls.length} ссылок</span>
                    )}
                    {isDup && <span className="tg-dup-badge">уже есть</span>}
                  </div>
                  {c.notes && c.notes !== (titles[c.id] ?? c.title) && (
                    <div className="tg-item-notes">{c.notes}</div>
                  )}
                </div>
              </label>
            );
          })}
        </div>

        <div className="mv-actions tg-actions">
          <button type="button" className="mv-btn mv-btn--ghost" onClick={onClose}>Отмена</button>
          <button
            type="button"
            className="mv-btn mv-btn--primary"
            disabled={selected.size === 0}
            onClick={handleImport}
          >
            Импортировать {selected.size}
          </button>
        </div>
      </div>
    </div>
  );
}
