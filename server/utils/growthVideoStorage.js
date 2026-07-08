const fs = require('fs').promises;
const path = require('path');

const growthVideoFile = path.join(__dirname, '..', 'data', 'growth-videos.json');

const CATEGORY_LABELS = {
  'df-dscore': 'DF & D-Score',
  pledge: 'Marketplace Pledge',
  general: 'Teaching',
};

const extractYouTubeId = (input) => {
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

const getYouTubeThumbnail = (youtubeId, quality = 'hqdefault') =>
  `https://i.ytimg.com/vi/${youtubeId}/${quality}.jpg`;

const fetchYouTubeMetadata = async (url) => {
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    );
    if (!response.ok) return null;
    const data = await response.json();
    return {
      title: data.title || '',
      thumbnail: data.thumbnail_url || '',
    };
  } catch {
    return null;
  }
};

const buildVideoFields = ({ url, youtubeId, title, category, categoryLabel, featured, sortOrder, published }) => {
  const id = youtubeId || extractYouTubeId(url);
  if (!id) {
    throw new Error('A valid YouTube URL or video ID is required');
  }

  const resolvedCategory = category || 'general';
  const resolvedUrl = url && url.includes(id) ? url : `https://www.youtube.com/watch?v=${id}`;

  return {
    youtubeId: id,
    title: (title || '').trim() || 'Untitled video',
    category: resolvedCategory,
    categoryLabel: (categoryLabel || CATEGORY_LABELS[resolvedCategory] || CATEGORY_LABELS.general).trim(),
    url: resolvedUrl,
    thumbnail: getYouTubeThumbnail(id, 'hqdefault'),
    thumbnailFallback: getYouTubeThumbnail(id, 'mqdefault'),
    featured: resolvedCategory === 'df-dscore',
    sortOrder: typeof sortOrder === 'number' ? sortOrder : Number(sortOrder) || 0,
    published: published !== false,
  };
};

const buildVideoFieldsWithMetadata = async (videoData) => {
  const fields = buildVideoFields(videoData);
  const metadata = await fetchYouTubeMetadata(fields.url);
  if (metadata) {
    if (!videoData.title?.trim() && metadata.title) {
      fields.title = metadata.title;
    }
    if (metadata.thumbnail) {
      fields.thumbnail = metadata.thumbnail;
      fields.thumbnailFallback = metadata.thumbnail;
    }
  }
  return fields;
};

const ensureGrowthVideoFile = async () => {
  try {
    await fs.access(growthVideoFile);
  } catch {
    await fs.writeFile(growthVideoFile, JSON.stringify([], null, 2));
  }
};

const getAllGrowthVideos = async () => {
  await ensureGrowthVideoFile();
  try {
    const data = await fs.readFile(growthVideoFile, 'utf8');
    const videos = JSON.parse(data);
    return videos.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  } catch {
    return [];
  }
};

const getPublishedGrowthVideos = async () => {
  const all = await getAllGrowthVideos();
  return all.filter((v) => v.published !== false);
};

const addGrowthVideo = async (videoData) => {
  await ensureGrowthVideoFile();
  const fields = await buildVideoFieldsWithMetadata(videoData);
  const all = await getAllGrowthVideos();

  const video = {
    id: Date.now().toString(),
    ...fields,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  all.push(video);
  await fs.writeFile(growthVideoFile, JSON.stringify(all, null, 2));
  return video;
};

const updateGrowthVideo = async (id, updates) => {
  await ensureGrowthVideoFile();
  const all = await getAllGrowthVideos();
  const index = all.findIndex((v) => v.id === id);
  if (index === -1) return null;

  const merged = {
    ...all[index],
    ...updates,
    url: updates.url !== undefined ? updates.url : all[index].url,
    youtubeId: updates.youtubeId !== undefined ? updates.youtubeId : all[index].youtubeId,
  };

  const fields = await buildVideoFieldsWithMetadata(merged);
  all[index] = {
    ...all[index],
    ...fields,
    updatedAt: new Date().toISOString(),
  };

  await fs.writeFile(growthVideoFile, JSON.stringify(all, null, 2));
  return all[index];
};

const deleteGrowthVideo = async (id) => {
  await ensureGrowthVideoFile();
  const all = await getAllGrowthVideos();
  const filtered = all.filter((v) => v.id !== id);
  await fs.writeFile(growthVideoFile, JSON.stringify(filtered, null, 2));
  return true;
};

module.exports = {
  extractYouTubeId,
  getYouTubeThumbnail,
  fetchYouTubeMetadata,
  buildVideoFields,
  buildVideoFieldsWithMetadata,
  CATEGORY_LABELS,
  getAllGrowthVideos,
  getPublishedGrowthVideos,
  addGrowthVideo,
  updateGrowthVideo,
  deleteGrowthVideo,
};
