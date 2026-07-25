import { GENRES, Genre } from '../../storage/movies';

export type StatusFilter = 'all' | 'watched' | 'unwatched';
export type SortMode = 'added' | 'year' | 'rating' | 'title';

interface Props {
  status: StatusFilter;
  genre: Genre | 'all';
  sort: SortMode;
  counts: { all: number; watched: number; unwatched: number };
  onStatusChange: (s: StatusFilter) => void;
  onGenreChange: (g: Genre | 'all') => void;
  onSortChange: (s: SortMode) => void;
}

const SORT_LABELS: Record<SortMode, string> = {
  added: 'Дата ↓',
  year: 'Год ↓',
  rating: 'Оценка ↓',
  title: 'Название',
};

export default function MoviesFilters({
  status, genre, sort, counts, onStatusChange, onGenreChange, onSortChange,
}: Props) {
  return (
    <div className="mv-filters">
      <div className="mv-chips">
        <button
          className={`mv-chip ${status === 'all' ? 'active' : ''}`}
          onClick={() => onStatusChange('all')}
        >Все ({counts.all})</button>
        <button
          className={`mv-chip ${status === 'unwatched' ? 'active' : ''}`}
          onClick={() => onStatusChange('unwatched')}
        >Не посмотрел ({counts.unwatched})</button>
        <button
          className={`mv-chip ${status === 'watched' ? 'active' : ''}`}
          onClick={() => onStatusChange('watched')}
        >Посмотрел ({counts.watched})</button>
      </div>

      <div className="mv-selects">
        <select
          value={genre}
          onChange={e => onGenreChange(e.target.value as Genre | 'all')}
        >
          <option value="all">Все жанры</option>
          {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
        </select>

        <select
          value={sort}
          onChange={e => onSortChange(e.target.value as SortMode)}
        >
          {(Object.keys(SORT_LABELS) as SortMode[]).map(k =>
            <option key={k} value={k}>{SORT_LABELS[k]}</option>
          )}
        </select>
      </div>
    </div>
  );
}
