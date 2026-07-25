const KEY = 'movies_data';

export const GENRES = [
  'Боевик',
  'Драма',
  'Комедия',
  'Триллер',
  'Ужасы',
  'Фантастика',
  'Фэнтези',
  'Детектив',
  'Мелодрама',
  'Приключения',
  'Мультфильм',
  'Аниме',
  'Документальный',
  'Криминал',
  'Сериал',
  'Другое',
] as const;

export type Genre = typeof GENRES[number];
export type WatchStatus = 'watched' | 'unwatched';

export type Movie = {
  id: string;
  title: string;
  url: string;
  poster: string;
  description?: string;
  genre: Genre;
  year: number;
  status: WatchStatus;
  rating?: number;         // 1-10
  notes?: string;
  addedAt: string;         // ISO
};

export type MoviesData = { movies: Movie[] };

const EMPTY: MoviesData = { movies: [] };

export function loadMovies(): MoviesData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.movies)) return EMPTY;
    return parsed;
  } catch {
    return EMPTY;
  }
}

export function saveMovies(data: MoviesData): void {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export type MovieInput = Omit<Movie, 'id' | 'addedAt'>;

export function addMovie(data: MoviesData, input: MovieInput): MoviesData {
  const movie: Movie = { ...input, id: uid(), addedAt: new Date().toISOString() };
  return { movies: [movie, ...data.movies] };
}

export function updateMovie(data: MoviesData, id: string, patch: Partial<MovieInput>): MoviesData {
  return {
    movies: data.movies.map(m => m.id === id ? { ...m, ...patch } : m),
  };
}

export function removeMovie(data: MoviesData, id: string): MoviesData {
  return { movies: data.movies.filter(m => m.id !== id) };
}

export function toggleStatus(data: MoviesData, id: string): MoviesData {
  return {
    movies: data.movies.map(m =>
      m.id === id ? { ...m, status: m.status === 'watched' ? 'unwatched' : 'watched' } : m,
    ),
  };
}

// --- Export / Import ---

export function exportJSON(data: MoviesData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `movies-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importJSON(text: string): MoviesData {
  const parsed = JSON.parse(text);
  if (!parsed || !Array.isArray(parsed.movies)) {
    throw new Error('Неверный формат JSON: ожидается { movies: [...] }');
  }
  const movies: Movie[] = parsed.movies
    .filter((m: any) => m && typeof m.title === 'string')
    .map((m: any) => ({
      id: typeof m.id === 'string' ? m.id : uid(),
      title: String(m.title),
      url: String(m.url ?? ''),
      poster: String(m.poster ?? ''),
      description: m.description ? String(m.description) : undefined,
      genre: (GENRES as readonly string[]).includes(m.genre) ? m.genre : 'Другое',
      year: Number.isFinite(m.year) ? Number(m.year) : new Date().getFullYear(),
      status: m.status === 'watched' ? 'watched' : 'unwatched',
      rating: Number.isFinite(m.rating) ? Number(m.rating) : undefined,
      notes: m.notes ? String(m.notes) : undefined,
      addedAt: typeof m.addedAt === 'string' ? m.addedAt : new Date().toISOString(),
    }));
  return { movies };
}
