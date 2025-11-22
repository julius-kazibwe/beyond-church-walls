const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  launchDate: {
    type: String,
    default: 'Mid-December',
  },
  launchDateFormatted: {
    type: Date,
    default: null,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  // Only one document should exist
  collection: 'sitesettings',
});

// Ensure only one settings document exists
siteSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      launchDate: 'Mid-December',
      launchDateFormatted: null,
    });
  }
  return settings;
};

siteSettingsSchema.statics.updateSettings = async function(updates) {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create(updates);
  } else {
    Object.assign(settings, updates);
    settings.updatedAt = new Date();
    await settings.save();
  }
  return settings;
};

module.exports = mongoose.models.SiteSettings || mongoose.model('SiteSettings', siteSettingsSchema);

