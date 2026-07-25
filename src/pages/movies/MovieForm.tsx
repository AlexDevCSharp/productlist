import { useState, FormEvent } from 'react';
import { Movie, MovieInput, GENRES, Genre, WatchStatus } from '../../storage/movies';

interface Props {
  initial?: Movie;
  onSubmit: (input: MovieInput) => void;
  onClose: () => void;
}

export default function MovieForm({ initial, onSubmit, onClose }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [url, setUrl] = useState(initial?.url ?? '');
  const [poster, setPoster] = useState(initial?.poster ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [genre, setGenre] = useState<Genre>(initial?.genre ?? 'Другое');
  const [year, setYear] = useState<string>(String(initial?.year ?? new Date().getFullYear()));
  const [status, setStatus] = useState<WatchStatus>(initial?.status ?? 'unwatched');
  const [rating, setRating] = useState<number>(initial?.rating ?? 7);
  const [ratingEnabled, setRatingEnabled] = useState<boolean>(initial?.rating != null);
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setError('Название обязательно');
    const yearNum = parseInt(year, 10);
    if (!Number.isFinite(yearNum) || yearNum < 1888 || yearNum > 2100) {
      return setError('Введите корректный год (1888–2100)');
    }
    onSubmit({
      title: title.trim(),
      url: url.trim(),
      poster: poster.trim(),
      description: description.trim() || undefined,
      genre,
      year: yearNum,
      status,
      rating: ratingEnabled ? rating : undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="mv-backdrop" onClick={onClose}>
      <div className="mv-modal" onClick={e => e.stopPropagation()}>
        <div className="mv-modal-header">
          <h2>{initial ? 'Редактировать фильм' : 'Добавить фильм'}</h2>
          <button className="mv-modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="mv-form">
          <label className="mv-field">
            <span>Название *</span>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Начало"
              autoFocus
            />
          </label>

          <label className="mv-field">
            <span>Ссылка</span>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://rezka.ag/…"
            />
          </label>

          <label className="mv-field">
            <span>Постер (URL картинки)</span>
            <input
              type="url"
              value={poster}
              onChange={e => setPoster(e.target.value)}
              placeholder="https://…/poster.jpg"
            />
          </label>
          {poster && (
            <div className="mv-poster-preview">
              <img
                src={poster}
                alt=""
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}

          <div className="mv-row2">
            <label className="mv-field">
              <span>Жанр</span>
              <select value={genre} onChange={e => setGenre(e.target.value as Genre)}>
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </label>

            <label className="mv-field">
              <span>Год *</span>
              <input
                type="number"
                min={1888}
                max={2100}
                value={year}
                onChange={e => setYear(e.target.value)}
              />
            </label>
          </div>

          <label className="mv-field">
            <span>Описание</span>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="О чём фильм…"
            />
          </label>

          <div className="mv-field mv-status-toggle">
            <span>Статус</span>
            <div className="mv-seg">
              <button
                type="button"
                className={`mv-seg-btn ${status === 'unwatched' ? 'active' : ''}`}
                onClick={() => setStatus('unwatched')}
              >Не посмотрел</button>
              <button
                type="button"
                className={`mv-seg-btn ${status === 'watched' ? 'active' : ''}`}
                onClick={() => setStatus('watched')}
              >Посмотрел</button>
            </div>
          </div>

          <div className="mv-field">
            <span>
              <label className="mv-rating-label">
                <input
                  type="checkbox"
                  checked={ratingEnabled}
                  onChange={e => setRatingEnabled(e.target.checked)}
                />
                Оценка {ratingEnabled && <strong>{rating}/10</strong>}
              </label>
            </span>
            {ratingEnabled && (
              <input
                type="range"
                min={1}
                max={10}
                value={rating}
                onChange={e => setRating(parseInt(e.target.value, 10))}
                className="mv-slider"
              />
            )}
          </div>

          <label className="mv-field">
            <span>Заметки</span>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Личные впечатления, кому советовать…"
            />
          </label>

          {error && <div className="mv-error">{error}</div>}

          <div className="mv-actions">
            <button type="button" className="mv-btn mv-btn--ghost" onClick={onClose}>Отмена</button>
            <button type="submit" className="mv-btn mv-btn--primary">
              {initial ? 'Сохранить' : 'Добавить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
