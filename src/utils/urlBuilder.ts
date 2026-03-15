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

  const id = config.contentId || '0';

  switch (config.contentType) {
    case 'movie':
      path = `/movie/${id}`;
      break;
    case 'tv':
      path = `/tv/${id}/${config.seasonNum || '1'}/${config.episodeNum || '1'}`;
      break;
    case 'anime-show':
      path = `/anime/${id}/${config.episodeNum || '1'}`;
      break;
    case 'anime-movie':
      path = `/anime/${id}`;
      break;
    default:
      path = `/movie/${id}`;
  }

  const url = new URL(`${baseUrl}${path}`);

  if (config.optDub) url.searchParams.append('dub', 'true');
  if (config.themeColor) {
    const color = config.themeColor.replace('#', '');
    if (color) url.searchParams.append('color', color);
  }
  if (config.optOverlay) url.searchParams.append('overlay', 'true');
  if (config.optNextBtn) url.searchParams.append('nextEpisode', 'true');
  if (config.optAutoplayNext) url.searchParams.append('autoplayNextEpisode', 'true');
  if (config.optEpisodeSelector) url.searchParams.append('episodeSelector', 'true');

  return url.toString();
}
