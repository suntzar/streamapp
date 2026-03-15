const TMDB_API_KEY = (import.meta as any).env.VITE_TMDB_API_KEY || ''; // O usuário deve adicionar VITE_TMDB_API_KEY ao .env
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export interface TMDBResult {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  overview: string;
  media_type: 'movie' | 'tv';
}

export async function searchContent(query: string): Promise<TMDBResult[]> {
  if (!TMDB_API_KEY || !query) return [];

  try {
    const response = await fetch(
      `${BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=pt-BR&include_adult=false`
    );
    const data = await response.json();
    return (data.results || []).filter(
      (item: any) => item.media_type === 'movie' || item.media_type === 'tv'
    );
  } catch (error) {
    console.error('Erro ao buscar no TMDB:', error);
    return [];
  }
}

export function getTMDBImageUrl(path: string | null): string {
  if (!path) return 'https://placehold.co/500x750/09090b/white?text=Sem+Poster';
  return `${IMAGE_BASE_URL}${path}`;
}

export function getTMDBBackdropUrl(path: string | null): string {
  if (!path) return '';
  return `https://image.tmdb.org/t/p/original${path}`;
}
