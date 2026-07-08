const GrowthVideo = require('../models/GrowthVideo');
const { getConnectionStatus } = require('./db');
const growthVideoStorage = require('./growthVideoStorage');

const mapVideo = (video) => ({
  id: video._id.toString(),
  youtubeId: video.youtubeId,
  title: video.title,
  category: video.category,
  categoryLabel: video.categoryLabel,
  url: video.url,
  thumbnail: video.thumbnail,
  thumbnailFallback: video.thumbnailFallback,
  featured: video.featured,
  sortOrder: video.sortOrder,
  published: video.published,
  createdAt: video.createdAt,
  updatedAt: video.updatedAt,
});

const getAllGrowthVideos = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const useMongoDB = getConnectionStatus();

  if (isProduction && !useMongoDB) {
    throw new Error('MongoDB connection required in production.');
  }

  if (useMongoDB) {
    const videos = await GrowthVideo.find().sort({ sortOrder: 1, createdAt: -1 });
    return videos.map(mapVideo);
  }

  if (!isProduction) {
    return growthVideoStorage.getAllGrowthVideos();
  }

  throw new Error('Storage system unavailable');
};

const getPublishedGrowthVideos = async () => {
  if (getConnectionStatus()) {
    const videos = await GrowthVideo.find({ published: true }).sort({ sortOrder: 1, createdAt: -1 });
    return videos.map(mapVideo);
  }
  return growthVideoStorage.getPublishedGrowthVideos();
};

const addGrowthVideo = async (videoData) => {
  if (getConnectionStatus()) {
    const existingVideos = await getAllGrowthVideos();
    const fields = await growthVideoStorage.validateGrowthVideoWrite({
      videoData,
      existingVideos,
      operation: 'create',
    });
    const video = new GrowthVideo(fields);
    await video.save();
    return mapVideo(video);
  }
  return growthVideoStorage.addGrowthVideo(videoData);
};

const updateGrowthVideo = async (id, updates) => {
  if (getConnectionStatus()) {
    const existing = await GrowthVideo.findById(id);
    if (!existing) throw new Error('Growth video not found');

    const existingVideos = await getAllGrowthVideos();
    const existingRecord = existingVideos.find((video) => video.id === id);

    const merged = {
      url: updates.url !== undefined ? updates.url : existing.url,
      youtubeId: updates.youtubeId !== undefined ? updates.youtubeId : existing.youtubeId,
      title: updates.title !== undefined ? updates.title : existing.title,
      category: updates.category !== undefined ? updates.category : existing.category,
      categoryLabel: updates.categoryLabel !== undefined ? updates.categoryLabel : existing.categoryLabel,
      sortOrder: updates.sortOrder !== undefined ? updates.sortOrder : existing.sortOrder,
      published: updates.published !== undefined ? updates.published : existing.published,
    };

    const fields = await growthVideoStorage.validateGrowthVideoWrite({
      videoData: merged,
      existingVideos,
      excludeId: id,
      existingRecord: existingRecord || mapVideo(existing),
      operation: 'update',
    });

    const video = await GrowthVideo.findByIdAndUpdate(
      id,
      { ...fields, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!video) throw new Error('Growth video not found');
    return mapVideo(video);
  }
  return growthVideoStorage.updateGrowthVideo(id, updates);
};

const deleteGrowthVideo = async (id) => {
  if (getConnectionStatus()) {
    const existing = await GrowthVideo.findById(id);
    if (!existing) throw new Error('Growth video not found');

    const existingVideos = await getAllGrowthVideos();
    const existingRecord = existingVideos.find((video) => video.id === id) || mapVideo(existing);

    await growthVideoStorage.validateGrowthVideoWrite({
      existingVideos,
      existingRecord,
      operation: 'delete',
    });

    await GrowthVideo.findByIdAndDelete(id);
    return;
  }
  return growthVideoStorage.deleteGrowthVideo(id);
};

module.exports = {
  getAllGrowthVideos,
  getPublishedGrowthVideos,
  addGrowthVideo,
  updateGrowthVideo,
  deleteGrowthVideo,
};
