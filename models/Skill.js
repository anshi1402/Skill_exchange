const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: ['teach', 'learn'], required: true },
    name: { type: String, required: true },
    category: { type: String, default: 'General' },
    proficiency: { type: String, default: 'Intermediate' }, // 'Beginner', 'Intermediate', 'Advanced', 'Expert'
    experience: { type: String, default: '' },
    endorsements: { type: Number, default: 0 }
}, {
    timestamps: true
});

module.exports = mongoose.model('Skill', SkillSchema);
