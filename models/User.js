const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, default: '' },
    userType: { type: String, default: 'Student' }, // 'Student', 'Professional', etc.
    institution: { type: String, default: '' },
    bio: { type: String, default: '' },
    location: { type: String, default: 'Online' },
    avatarColor: { type: String, default: 'from-blue-500 to-indigo-600' },
    avatarInitial: { type: String, default: '' },
    joinedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    interests: [{ type: String }],
    availability: { type: String, default: 'Available' },
    stats: {
        sharesCompleted: { type: Number, default: 0 },
        sessionsCompleted: { type: Number, default: 0 },
        totalHours: { type: Number, default: 0 },
        streakDays: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
