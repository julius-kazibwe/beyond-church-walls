const SiteSettings = require('../models/SiteSettings');
const { getConnectionStatus } = require('./db');
const siteSettingsStorage = require('./siteSettingsStorage'); // Fallback

const getSiteSettings = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const useMongoDB = getConnectionStatus();
  
  if (isProduction && !useMongoDB) {
    throw new Error('MongoDB connection required in production.');
  }
  
  if (useMongoDB) {
    const settings = await SiteSettings.getSettings();
    return {
      launchDate: settings.launchDate || 'Mid-December',
      launchDateFormatted: settings.launchDateFormatted || null,
      updatedAt: settings.updatedAt,
    };
  }
  
  if (!isProduction) {
    return siteSettingsStorage.getSiteSettings();
  }
  
  throw new Error('Storage system unavailable');
};

const updateSiteSettings = async (updates) => {
  if (getConnectionStatus()) {
    const settings = await SiteSettings.updateSettings(updates);
    return {
      launchDate: settings.launchDate || 'Mid-December',
      launchDateFormatted: settings.launchDateFormatted || null,
      updatedAt: settings.updatedAt,
    };
  }
  return siteSettingsStorage.updateSiteSettings(updates);
};

module.exports = {
  getSiteSettings,
  updateSiteSettings,
};

