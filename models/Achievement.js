const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    badgeId: { type: String, required: true },
    unlocked: { type: Boolean, default: false },
    unlockedAt: { type: String, default: null },
    progress: { type: Number, default: 0 }
}, {
    timestamps: true
});

module.exports = mongoose.model('Achievement', AchievementSchema);
