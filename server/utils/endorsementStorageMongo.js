const Endorsement = require('../models/Endorsement');
const { getConnectionStatus } = require('./db');
const endorsementStorage = require('./endorsementStorage'); // Fallback

const getAllEndorsements = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const useMongoDB = getConnectionStatus();
  
  if (isProduction && !useMongoDB) {
    throw new Error('MongoDB connection required in production.');
  }
  
  if (useMongoDB) {
    const endorsements = await Endorsement.find().sort({ createdAt: -1 });
    return endorsements.map(e => ({
      id: e._id.toString(),
      name: e.name,
      title: e.title,
      quote: e.quote,
      type: e.type,
      approved: e.approved,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    }));
  }
  
  if (!isProduction) {
    return endorsementStorage.getAllEndorsements();
  }
  
  throw new Error('Storage system unavailable');
};

const getApprovedEndorsements = async (type = null) => {
  if (getConnectionStatus()) {
    const query = { approved: true };
    if (type) query.type = type;
    const endorsements = await Endorsement.find(query).sort({ createdAt: -1 });
    return endorsements.map(e => ({
      id: e._id.toString(),
      name: e.name,
      title: e.title,
      quote: e.quote,
      type: e.type,
      approved: e.approved,
      createdAt: e.createdAt,
    }));
  }
  return endorsementStorage.getApprovedEndorsements(type);
};

const addEndorsement = async (endorsementData) => {
  if (getConnectionStatus()) {
    const endorsement = new Endorsement({
      ...endorsementData,
      approved: false,
    });
    await endorsement.save();
    return {
      id: endorsement._id.toString(),
      name: endorsement.name,
      title: endorsement.title,
      quote: endorsement.quote,
      type: endorsement.type,
      approved: endorsement.approved,
      createdAt: endorsement.createdAt,
    };
  }
  return endorsementStorage.addEndorsement(endorsementData);
};

const updateEndorsement = async (id, updates) => {
  if (getConnectionStatus()) {
    const endorsement = await Endorsement.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
    if (!endorsement) throw new Error('Endorsement not found');
    return {
      id: endorsement._id.toString(),
      name: endorsement.name,
      title: endorsement.title,
      quote: endorsement.quote,
      type: endorsement.type,
      approved: endorsement.approved,
      createdAt: endorsement.createdAt,
    };
  }
  return endorsementStorage.updateEndorsement(id, updates);
};

const updateEndorsementApproval = async (id, approved) => {
  if (getConnectionStatus()) {
    const endorsement = await Endorsement.findByIdAndUpdate(
      id,
      { approved, updatedAt: new Date() },
      { new: true }
    );
    if (!endorsement) throw new Error('Endorsement not found');
    return {
      id: endorsement._id.toString(),
      name: endorsement.name,
      title: endorsement.title,
      quote: endorsement.quote,
      type: endorsement.type,
      approved: endorsement.approved,
      createdAt: endorsement.createdAt,
    };
  }
  return endorsementStorage.updateEndorsementApproval(id, approved);
};

const deleteEndorsement = async (id) => {
  if (getConnectionStatus()) {
    await Endorsement.findByIdAndDelete(id);
    return;
  }
  return endorsementStorage.deleteEndorsement(id);
};

module.exports = {
  getAllEndorsements,
  getApprovedEndorsements,
  addEndorsement,
  updateEndorsement,
  updateEndorsementApproval,
  deleteEndorsement,
};

