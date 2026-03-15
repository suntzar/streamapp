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

/**
 * Constrói a URL do player seguindo estritamente a lógica do exemplo funcional (Vanilla JS)
 */
export function buildPlayerUrl(config: PlayerConfig): string {
  const baseUrl = 'https://player.videasy.net';
  let path = '';

  const id = (config.contentId || '').trim();
  const season = (config.seasonNum || '1').trim();
  const episode = (config.episodeNum || '1').trim();

  // 1. Estrutura da Rota
  if (config.contentType === 'movie') path = `/movie/${id}`;
  else if (config.contentType === 'tv') path = `/tv/${id}/${season}/${episode}`;
  else if (config.contentType === 'anime-show') path = `/anime/${id}/${episode}`;
  else if (config.contentType === 'anime-movie') path = `/anime/${id}`;
  else path = `/movie/${id}`;

  let finalUrl = baseUrl + path;

  // 2. Montagem dos Parâmetros (Query Strings)
  const params = new URLSearchParams();

  // Ordem e lógica idênticas ao exemplo funcional
  if (config.contentType.startsWith('anime') && config.optDub) {
    params.append('dub', 'true');
  }

  if (config.themeColor) {
    const color = config.themeColor.replace('#', '');
    if (color) params.append('color', color);
  }

  if (config.optOverlay) {
    params.append('overlay', 'true');
  }

  if (config.contentType === 'tv') {
    if (config.optNextBtn) params.append('nextEpisode', 'true');
    if (config.optAutoplayNext) params.append('autoplayNextEpisode', 'true');
    if (config.optEpisodeSelector) params.append('episodeSelector', 'true');
  }

  const queryString = params.toString();
  if (queryString) {
    finalUrl += '?' + queryString;
  }

  return finalUrl;
}
