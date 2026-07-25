import { useEffect, useMemo, useState, useRef } from 'react';
import {
  Movie,
  MovieInput,
  MoviesData,
  loadMovies,
  saveMovies,
  addMovie,
  updateMovie,
  removeMovie,
  toggleStatus,
  exportJSON,
  importJSON,
  Genre,
} from '../storage/movies';
import MovieCard from './movies/MovieCard';
import MovieForm from './movies/MovieForm';
import MoviesFilters, { StatusFilter, SortMode } from './movies/MoviesFilters';
import TelegramImportModal from './movies/TelegramImportModal';
import { parseTelegramExport, MovieCandidate } from '../storage/telegramImport';

export default function MoviesPage() {
  const [data, setData] = useState<MoviesData>(loadMovies);
  const [showMenu, setShowMenu] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Movie | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [genreFilter, setGenreFilter] = useState<Genre | 'all'>('all');
  const [sortMode, setSortMode] = useState<SortMode>('added');
  const importInputRef = useRef<HTMLInputElement>(null);
  const [tgCandidates, setTgCandidates] = useState<MovieCandidate[] | null>(null);

  useEffect(() => { saveMovies(data); }, [data]);

  const counts = useMemo(() => ({
    all: data.movies.length,
    watched: data.movies.filter(m => m.status === 'watched').length,
    unwatched: data.movies.filter(m => m.status === 'unwatched').length,
  }), [data.movies]);

  const filtered = useMemo(() => {
    let list = data.movies;
    if (statusFilter !== 'all') list = list.filter(m => m.status === statusFilter);
    if (genreFilter !== 'all') list = list.filter(m => m.genre === genreFilter);
    const sorted = [...list];
    switch (sortMode) {
      case 'added':  sorted.sort((a, b) => b.addedAt.localeCompare(a.addedAt)); break;
      case 'year':   sorted.sort((a, b) => b.year - a.year); break;
      case 'rating': sorted.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1)); break;
      case 'title':  sorted.sort((a, b) => a.title.localeCompare(b.title, 'ru')); break;
    }
    return sorted;
  }, [data.movies, statusFilter, genreFilter, sortMode]);

  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (m: Movie) => { setEditing(m); setFormOpen(true); };

  const handleSubmit = (input: MovieInput) => {
    if (editing) setData(updateMovie(data, editing.id, input));
    else setData(addMovie(data, input));
    setFormOpen(false);
    setEditing(null);
  };

  const handleImportClick = () => importInputRef.current?.click();

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      let parsed: any;
      try { parsed = JSON.parse(text); }
      catch { throw new Error('Файл не является валидным JSON'); }

      // Telegram Desktop export → open preview modal
      if (Array.isArray(parsed?.messages)) {
        const candidates = parseTelegramExport(text);
        if (candidates.length === 0) {
          alert('В этом экспорте нет сообщений со ссылками.');
          return;
        }
        setTgCandidates(candidates);
        return;
      }

      // Own format
      if (Array.isArray(parsed?.movies)) {
        const imported = importJSON(text);
        if (data.movies.length > 0) {
          const merge = confirm(
            `Импортировано ${imported.movies.length} фильмов.\n\n` +
            `OK — объединить с текущими (${data.movies.length})\n` +
            `Отмена — заменить полностью`,
          );
          if (merge) {
            const existingIds = new Set(data.movies.map(m => m.id));
            const merged = [
              ...data.movies,
              ...imported.movies.filter(m => !existingIds.has(m.id)),
            ];
            setData({ movies: merged });
          } else {
            setData(imported);
          }
        } else {
          setData(imported);
        }
        return;
      }

      throw new Error('Неизвестный формат: ожидается { movies: [...] } или экспорт Telegram Desktop.');
    } catch (err: any) {
      alert(`Ошибка импорта: ${err?.message ?? err}`);
    }
  };

  const handleTgImport = (movies: MovieInput[]) => {
    let next = data;
    for (const m of movies) next = addMovie(next, m);
    setData(next);
    setTgCandidates(null);
  };

  return (
    <div className="page">
      <header className="header">
        <div className="header-top">
          <div className="header-icon">🎬</div>
          <h1>Фильмы</h1>
          {counts.all > 0 && (
            <div className="stats">
              {counts.watched}/{counts.all} посмотрено
            </div>
          )}
        </div>
        <button className="menu-btn" onClick={() => setShowMenu(!showMenu)}>⋮</button>
        {showMenu && (
          <>
            <div className="menu-overlay" onClick={() => setShowMenu(false)} />
            <div className="menu-dropdown">
              <button onClick={() => { exportJSON(data); setShowMenu(false); }}>
                📤 Экспорт JSON
              </button>
              <button onClick={() => { handleImportClick(); setShowMenu(false); }}>
                📥 Импорт JSON / Telegram
              </button>
            </div>
          </>
        )}
        <input
          ref={importInputRef}
          type="file"
          accept="application/json,.json"
          style={{ display: 'none' }}
          onChange={handleImportFile}
        />
      </header>

      <div className="mv-toolbar">
        <button className="mv-add-btn" onClick={openAdd}>
          <span>+</span> Добавить фильм
        </button>
      </div>

      {data.movies.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🎬</div>
          <p>Пока ни одного фильма</p>
          <p className="hint">Нажми «Добавить фильм» — впиши название, ссылку и постер</p>
        </div>
      ) : (
        <>
          <MoviesFilters
            status={statusFilter}
            genre={genreFilter}
            sort={sortMode}
            counts={counts}
            onStatusChange={setStatusFilter}
            onGenreChange={setGenreFilter}
            onSortChange={setSortMode}
          />

          {filtered.length === 0 ? (
            <div className="empty">
              <p>По этим фильтрам ничего нет</p>
            </div>
          ) : (
            <div className="movies-grid">
              {filtered.map(m => (
                <MovieCard
                  key={m.id}
                  movie={m}
                  onToggleStatus={id => setData(toggleStatus(data, id))}
                  onEdit={openEdit}
                  onDelete={id => setData(removeMovie(data, id))}
                />
              ))}
            </div>
          )}
        </>
      )}

      {formOpen && (
        <MovieForm
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onClose={() => { setFormOpen(false); setEditing(null); }}
        />
      )}

      {tgCandidates && (
        <TelegramImportModal
          candidates={tgCandidates}
          existingUrls={new Set(data.movies.map(m => m.url).filter(Boolean))}
          onImport={handleTgImport}
          onClose={() => setTgCandidates(null)}
        />
      )}
    </div>
  );
}
