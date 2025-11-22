const fs = require('fs').promises;
const path = require('path');

const settingsFile = path.join(__dirname, '..', 'data', 'site-settings.json');

// Default site settings
const defaultSettings = {
  launchDate: 'Mid-December',
  launchDateFormatted: null, // Optional: ISO date format for sorting/display
  updatedAt: new Date().toISOString()
};

// Ensure settings file exists
const ensureSettingsFile = async () => {
  try {
    await fs.access(settingsFile);
  } catch {
    // Create with default settings if file doesn't exist
    await fs.writeFile(settingsFile, JSON.stringify(defaultSettings, null, 2));
  }
};

// Get site settings
const getSiteSettings = async () => {
  await ensureSettingsFile();
  try {
    const data = await fs.readFile(settingsFile, 'utf8');
    const settings = JSON.parse(data);
    // Merge with defaults to ensure all fields exist
    return { ...defaultSettings, ...settings };
  } catch (error) {
    return defaultSettings;
  }
};

// Update site settings
const updateSiteSettings = async (updates) => {
  await ensureSettingsFile();
  const currentSettings = await getSiteSettings();
  const updatedSettings = {
    ...currentSettings,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  await fs.writeFile(settingsFile, JSON.stringify(updatedSettings, null, 2));
  return updatedSettings;
};

module.exports = {
  getSiteSettings,
  updateSiteSettings,
};

