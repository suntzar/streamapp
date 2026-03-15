export interface PlayerConfig {
  contentType: string;
  contentId: string;
  seasonNum?: string;
  episodeNum?: string;
  themeColor?: string;
  optOverlay?: boolean;
  optNextBtn?: boolean;
  optAutoplayNext?: boolean;
  optEpisodeSelector?: boolean;
  optDub?: boolean;
}

export function buildPlayerUrl(config: PlayerConfig): string {
  const baseUrl = 'https://player.videasy.net';
  let path = '';

  // Sanitize ID and numbers to avoid broken URLs
  const id = encodeURIComponent((config.contentId || '').trim());
  const season = encodeURIComponent((config.seasonNum || '1').trim());
  const episode = encodeURIComponent((config.episodeNum || '1').trim());

  switch (config.contentType) {
    case 'movie':
      path = `/movie/${id}`;
      break;
    case 'tv':
      path = `/tv/${id}/${season}/${episode}`;
      break;
    case 'anime-show':
      path = `/anime/${id}/${episode}`;
      break;
    case 'anime-movie':
      path = `/anime/${id}`;
      break;
    default:
      path = `/movie/${id}`;
  }

  const url = new URL(`${baseUrl}${path}`);

  // Parâmetros Globais (Filmes, Séries e Animes)
  if (config.themeColor) {
    const color = config.themeColor.replace('#', '');
    if (color && color.length >= 3) url.searchParams.append('color', color);
  }
  
  if (config.optOverlay) {
    url.searchParams.append('overlay', 'true');
  }

  // Parâmetros Específicos para Séries e Animes (Episódios)
  const isEpisodic = config.contentType === 'tv' || config.contentType === 'anime-show';
  
  if (isEpisodic) {
    if (config.optNextBtn) url.searchParams.append('nextEpisode', 'true');
    if (config.optAutoplayNext) url.searchParams.append('autoplayNextEpisode', 'true');
    if (config.optEpisodeSelector) url.searchParams.append('episodeSelector', 'true');
  }

  // Parâmetro de Dublagem (Apenas Animes)
  if (config.contentType.startsWith('anime') && config.optDub) {
    url.searchParams.append('dub', 'true');
  }

  return url.toString();
}
