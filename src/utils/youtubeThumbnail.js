export const YOUTUBE_THUMB_QUALITIES = ['maxresdefault', 'hqdefault', 'mqdefault', 'sddefault'];

export const extractYouTubeId = (input) => {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /[?&]v=([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) return match[1];
  }

  return null;
};

export const getYouTubeThumbnail = (youtubeId, quality = 'hqdefault') => {
  if (!youtubeId) return '';
  return `https://i.ytimg.com/vi/${youtubeId}/${quality}.jpg`;
};

export const getYouTubeThumbnailCandidates = (youtubeId) =>
  YOUTUBE_THUMB_QUALITIES.map((quality) => getYouTubeThumbnail(youtubeId, quality));
