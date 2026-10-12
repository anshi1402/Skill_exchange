const mongoose = require('mongoose');

const MilestoneSchema = new mongoose.Schema({
    id: { type: String, required: true },
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: String, default: null }
}, { _id: false });

const GoalSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    skill: { type: String, default: '' },
    category: { type: String, default: 'General' },
    targetDate: { type: String, default: '' },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    milestones: [MilestoneSchema],
    completed: { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports = mongoose.model('Goal', GoalSchema);
