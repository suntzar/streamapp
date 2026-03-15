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

  const id = (config.contentId || '').trim();
  const season = (config.seasonNum || '1').trim();
  const episode = (config.episodeNum || '1').trim();

  // URL Structure according to documentation
  if (config.contentType === 'movie') {
    path = `/movie/${id}`;
  } else if (config.contentType === 'tv') {
    path = `/tv/${id}/${season}/${episode}`;
  } else if (config.contentType === 'anime-show') {
    path = `/anime/${id}/${episode}`;
  } else if (config.contentType === 'anime-movie') {
    path = `/anime/${id}`;
  } else {
    path = `/movie/${id}`;
  }

  let finalUrl = baseUrl + path;

  // Customization Parameters (Query Strings)
  const params = new URLSearchParams();

  // color: Hex color codes without the # symbol
  if (config.themeColor) {
    const color = config.themeColor.replace('#', '');
    if (color) params.append('color', color);
  }

  // dub: true|false (Anime only)
  if (config.contentType.startsWith('anime') && config.optDub) {
    params.append('dub', 'true');
  }

  // overlay: Netflix-style overlay
  if (config.optOverlay) {
    params.append('overlay', 'true');
  }

  // Episodic features
  if (config.contentType === 'tv' || config.contentType === 'anime-show') {
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
