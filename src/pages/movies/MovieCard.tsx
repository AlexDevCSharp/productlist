import { useState } from 'react';
import { Movie } from '../../storage/movies';

interface Props {
  movie: Movie;
  onToggleStatus: (id: string) => void;
  onEdit: (movie: Movie) => void;
  onDelete: (id: string) => void;
}

export default function MovieCard({ movie, onToggleStatus, onEdit, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const handleCardClick = () => {
    if (movie.url) window.open(movie.url, '_blank', 'noopener,noreferrer');
  };

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      className={`movie-card ${movie.status === 'watched' ? 'movie-card--watched' : ''}`}
      onClick={handleCardClick}
      role="button"
    >
      <div className="movie-poster">
        {movie.poster && !imgFailed ? (
          <img src={movie.poster} alt={movie.title} onError={() => setImgFailed(true)} />
        ) : (
          <div className="movie-poster-fallback">🎬</div>
        )}

        <button
          className={`movie-status-badge ${movie.status === 'watched' ? 'watched' : ''}`}
          onClick={e => { stop(e); onToggleStatus(movie.id); }}
          title={movie.status === 'watched' ? 'Отметить как непросмотренное' : 'Отметить как просмотренное'}
        >
          {movie.status === 'watched' ? '✓' : '○'}
        </button>

        <div className="movie-menu" onClick={stop}>
          <button
            className="movie-menu-btn"
            onClick={() => setMenuOpen(v => !v)}
          >⋮</button>
          {menuOpen && (
            <>
              <div className="movie-menu-overlay" onClick={() => setMenuOpen(false)} />
              <div className="movie-menu-dropdown">
                <button onClick={() => { onEdit(movie); setMenuOpen(false); }}>
                  ✏️ Редактировать
                </button>
                <button onClick={() => {
                  if (confirm(`Удалить «${movie.title}»?`)) {
                    onDelete(movie.id);
                  }
                  setMenuOpen(false);
                }}>
                  🗑 Удалить
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="movie-info">
        <h3 className="movie-title" title={movie.title}>{movie.title}</h3>
        <div className="movie-meta">
          <span>{movie.year}</span>
          <span className="movie-dot">·</span>
          <span>{movie.genre}</span>
        </div>
        {movie.rating != null && (
          <div className="movie-rating">★ {movie.rating}/10</div>
        )}
        {movie.description && (
          <p className="movie-desc">{movie.description}</p>
        )}
        {movie.notes && (
          <p className="movie-notes">📝 {movie.notes}</p>
        )}
      </div>
    </div>
  );
}
