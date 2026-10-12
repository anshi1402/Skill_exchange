const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    type: { type: String, default: 'practice' }, // 'learning', 'teaching', 'practice', 'knowledge_sharing', 'project'
    skill: { type: String, default: '' },
    duration: { type: Number, default: 0 }, // in minutes
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    notes: { type: String, default: '' },
    partnerId: { type: String, default: null }
}, {
    timestamps: true
});

module.exports = mongoose.model('Activity', ActivitySchema);
