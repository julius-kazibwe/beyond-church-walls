const fs = require('fs').promises;
const path = require('path');

const growthVideoFile = path.join(__dirname, '..', 'data', 'growth-videos.json');

const VALID_CATEGORIES = ['df-dscore', 'pledge', 'general'];

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

const isAllowedYouTubeUrl = (url) => {
  if (!url || typeof url !== 'string') return false;

  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    return host === 'youtube.com' || host === 'youtu.be' || host === 'm.youtube.com';
  } catch {
    return false;
  }
};

const assertAllowedYouTubeInput = (url, youtubeId) => {
  if (url && !isAllowedYouTubeUrl(url)) {
    throw new Error('Only youtube.com and youtu.be links are allowed');
  }

  const id = youtubeId || extractYouTubeId(url);
  if (!id) {
    throw new Error('A valid YouTube URL or video ID is required');
  }

  if (url && extractYouTubeId(url) !== id && youtubeId && extractYouTubeId(url)) {
    throw new Error('YouTube URL and video ID do not match');
  }

  return id;
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

const assertValidCategory = (category) => {
  if (!VALID_CATEGORIES.includes(category)) {
    throw new Error('Invalid category. Use df-dscore, pledge, or general.');
  }
};

const assertNoDuplicateYoutubeId = (videos, youtubeId, excludeId = null) => {
  const duplicate = videos.find(
    (video) => video.youtubeId === youtubeId && video.id !== excludeId
  );
  if (duplicate) {
    throw new Error('A video with this YouTube ID already exists');
  }
};

const assertDfDscoreRules = ({ videos, fields, excludeId = null, existingRecord = null, operation }) => {
  if (operation === 'delete') {
    if (existingRecord?.category === 'df-dscore') {
      throw new Error(
        'Cannot delete the DF & D-Score video. Edit it in place or change its category after assigning a replacement.'
      );
    }
    return;
  }

  const otherDfDscore = videos.find(
    (video) => video.category === 'df-dscore' && video.id !== excludeId
  );

  if (fields.category === 'df-dscore' && otherDfDscore) {
    throw new Error(
      'Only one DF & D-Score video is allowed. Edit the existing one or change its category first.'
    );
  }

  if (existingRecord?.category === 'df-dscore') {
    if (fields.category !== 'df-dscore') {
      throw new Error(
        'Cannot change the DF & D-Score video category without a replacement. Edit the video in place instead.'
      );
    }
    if (fields.published === false) {
      throw new Error('The DF & D-Score video cannot be unpublished.');
    }
  }
};

const buildVideoFields = ({ url, youtubeId, title, category, categoryLabel, sortOrder, published }) => {
  const id = assertAllowedYouTubeInput(url, youtubeId);

  const resolvedCategory = category || 'general';
  assertValidCategory(resolvedCategory);

  const resolvedUrl = url && url.includes(id) ? url.trim() : `https://www.youtube.com/watch?v=${id}`;

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

  if (!metadata) {
    throw new Error(
      'This YouTube video could not be verified. Check that the link is correct and the video is public.'
    );
  }

  if (!videoData.title?.trim() && metadata.title) {
    fields.title = metadata.title;
  }
  if (metadata.thumbnail) {
    fields.thumbnail = metadata.thumbnail;
    fields.thumbnailFallback = metadata.thumbnail;
  }

  return fields;
};

const hasUrlOrIdChanged = (videoData, existingRecord) => {
  if (!existingRecord) return true;

  const nextId = assertAllowedYouTubeInput(
    videoData.url !== undefined ? videoData.url : existingRecord.url,
    videoData.youtubeId !== undefined ? videoData.youtubeId : existingRecord.youtubeId
  );

  return nextId !== existingRecord.youtubeId
    || (videoData.url !== undefined && videoData.url.trim() !== existingRecord.url);
};

const validateGrowthVideoWrite = async ({
  videoData,
  existingVideos,
  excludeId = null,
  existingRecord = null,
  operation = 'create',
}) => {
  if (operation === 'delete') {
    assertDfDscoreRules({ videos: existingVideos, existingRecord, operation: 'delete' });
    return null;
  }

  const preliminaryFields = buildVideoFields(videoData);
  assertNoDuplicateYoutubeId(existingVideos, preliminaryFields.youtubeId, excludeId);
  assertDfDscoreRules({
    videos: existingVideos,
    fields: preliminaryFields,
    excludeId,
    existingRecord,
    operation,
  });

  if (operation === 'create' || hasUrlOrIdChanged(videoData, existingRecord)) {
    return buildVideoFieldsWithMetadata(videoData);
  }

  return {
    ...preliminaryFields,
    thumbnail: existingRecord.thumbnail,
    thumbnailFallback: existingRecord.thumbnailFallback,
  };
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
  const all = await getAllGrowthVideos();
  const fields = await validateGrowthVideoWrite({
    videoData,
    existingVideos: all,
    operation: 'create',
  });

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

  const existing = all[index];
  const merged = {
    ...existing,
    ...updates,
    url: updates.url !== undefined ? updates.url : existing.url,
    youtubeId: updates.youtubeId !== undefined ? updates.youtubeId : existing.youtubeId,
    title: updates.title !== undefined ? updates.title : existing.title,
    category: updates.category !== undefined ? updates.category : existing.category,
    categoryLabel: updates.categoryLabel !== undefined ? updates.categoryLabel : existing.categoryLabel,
    sortOrder: updates.sortOrder !== undefined ? updates.sortOrder : existing.sortOrder,
    published: updates.published !== undefined ? updates.published : existing.published,
  };

  const fields = await validateGrowthVideoWrite({
    videoData: merged,
    existingVideos: all,
    excludeId: id,
    existingRecord: existing,
    operation: 'update',
  });

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
  const existing = all.find((v) => v.id === id);
  if (!existing) {
    throw new Error('Growth video not found');
  }

  await validateGrowthVideoWrite({
    existingVideos: all,
    existingRecord: existing,
    operation: 'delete',
  });

  const filtered = all.filter((v) => v.id !== id);
  await fs.writeFile(growthVideoFile, JSON.stringify(filtered, null, 2));
  return true;
};

module.exports = {
  VALID_CATEGORIES,
  extractYouTubeId,
  isAllowedYouTubeUrl,
  getYouTubeThumbnail,
  fetchYouTubeMetadata,
  buildVideoFields,
  buildVideoFieldsWithMetadata,
  validateGrowthVideoWrite,
  CATEGORY_LABELS,
  getAllGrowthVideos,
  getPublishedGrowthVideos,
  addGrowthVideo,
  updateGrowthVideo,
  deleteGrowthVideo,
};
