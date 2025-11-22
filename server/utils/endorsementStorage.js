const fs = require('fs').promises;
const path = require('path');

const endorsementFile = path.join(__dirname, '..', 'data', 'endorsements.json');

// Default endorsements (pastoral voices)
const defaultEndorsements = [
  {
    id: '1',
    name: "Dr. Fred Wantante Setttuba-Male",
    title: "Senior Pastor, Makerere Full Gospel Church",
    quote: "Beyond Church Walls presents Bible-based tools to integrate work and worship with a mission mindset in the 21st century. It is laced with testimonies of Christian workers in the trenches of real-life situations, inspiring scholars, practitioners, and ordinary believers alike to live out their faith in the workplace. This book is a must-read for anyone studying or interested in spirituality in the workplace.",
    type: 'pastoral',
    approved: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: "Dr. Joseph Serwadda",
    title: "Presiding Apostle of the Born-Again Faith, Uganda",
    quote: "Beyond Church Walls is a powerful call to live out faith with authenticity and purpose. Blending spiritual insight with practical wisdom, it challenges believers to move beyond the pews and bring Christ's love to life through service and godly influence. A must-read for those ready to make faith a daily reality.",
    type: 'pastoral',
    approved: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: "Rev. Peter Kasirivu",
    title: "Founder and Team Leader, Gaba Community Church & Africa Renewal Ministries",
    quote: "Rev. Kasirye is a prophetic voice in the marketplace, revealing how God has guided his professional and spiritual journey. His book testifies to a life of integrity, vision, and obedience lived across cultures. With depth and authenticity, it shows how faith thrives amid modern pressures. An inspiring work that offers hope, strength, and purpose against all odds.",
    type: 'pastoral',
    approved: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: "Bishop Michael Kyazze",
    title: "Lead Pastor, Omega Healing Centre, Namasuba, Uganda",
    quote: "Rev. John William Kasirye extends a refreshing and urgent call to the Body of Christ—a divine reset for those weary of routine and bound by tradition. Beyond Church Walls reminds us that the world is our true diocese and the marketplace our mission field. This is a prophetic and empowering message, stirring believers to carry the Gospel into every sphere of influence with renewed passion and purpose.",
    type: 'pastoral',
    approved: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    name: "Pastor Paul Kinatama",
    title: "General Overseer, Full Gospel Churches of Uganda",
    quote: "I have known Rev. John William Kasirye since he first joined Makerere Full Gospel Church over four decades ago. His walk with God has always carried a prophetic edge—and this book is no exception. Beyond Church Walls is a must-read, a must-act message for our time, and a must-have on every believer's library shelf. It calls every believer to rise, reclaim the workplace, and reveal God's Kingdom in every sphere of life.",
    type: 'pastoral',
    approved: true,
    createdAt: new Date().toISOString()
  }
];

// Ensure endorsement file exists
const ensureEndorsementFile = async () => {
  try {
    await fs.access(endorsementFile);
  } catch {
    // Create with default endorsements
    await fs.writeFile(endorsementFile, JSON.stringify(defaultEndorsements, null, 2));
  }
};

// Get all endorsements
const getAllEndorsements = async () => {
  await ensureEndorsementFile();
  try {
    const data = await fs.readFile(endorsementFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return defaultEndorsements;
  }
};

// Get approved endorsements only
const getApprovedEndorsements = async (type = null) => {
  const allEndorsements = await getAllEndorsements();
  let filtered = allEndorsements.filter(e => e.approved === true);
  if (type) {
    filtered = filtered.filter(e => e.type === type);
  }
  return filtered;
};

// Add endorsement
const addEndorsement = async (name, title, quote, type = 'pastoral') => {
  await ensureEndorsementFile();
  const endorsement = {
    id: Date.now().toString(),
    name: name || '',
    title: title || '',
    quote: quote || '',
    type: type,
    approved: false, // Default to not approved
    createdAt: new Date().toISOString()
  };
  
  const allEndorsements = await getAllEndorsements();
  allEndorsements.push(endorsement);
  await fs.writeFile(endorsementFile, JSON.stringify(allEndorsements, null, 2));
  return endorsement;
};

// Update endorsement approval status
const updateEndorsementApproval = async (id, approved) => {
  await ensureEndorsementFile();
  const allEndorsements = await getAllEndorsements();
  const index = allEndorsements.findIndex(e => e.id === id);
  if (index !== -1) {
    allEndorsements[index].approved = approved;
    allEndorsements[index].approvedAt = approved ? new Date().toISOString() : null;
    await fs.writeFile(endorsementFile, JSON.stringify(allEndorsements, null, 2));
    return allEndorsements[index];
  }
  return null;
};

// Update endorsement
const updateEndorsement = async (id, updates) => {
  await ensureEndorsementFile();
  const allEndorsements = await getAllEndorsements();
  const index = allEndorsements.findIndex(e => e.id === id);
  if (index !== -1) {
    allEndorsements[index] = { ...allEndorsements[index], ...updates };
    await fs.writeFile(endorsementFile, JSON.stringify(allEndorsements, null, 2));
    return allEndorsements[index];
  }
  return null;
};

// Delete endorsement
const deleteEndorsement = async (id) => {
  await ensureEndorsementFile();
  const allEndorsements = await getAllEndorsements();
  const filtered = allEndorsements.filter(e => e.id !== id);
  await fs.writeFile(endorsementFile, JSON.stringify(filtered, null, 2));
  return true;
};

module.exports = {
  getAllEndorsements,
  getApprovedEndorsements,
  addEndorsement,
  updateEndorsementApproval,
  updateEndorsement,
  deleteEndorsement,
};

