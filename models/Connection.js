const mongoose = require('mongoose');

const ConnectionSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, index: true },
    senderId: { type: String, required: true, index: true },
    receiverId: { type: String, required: true, index: true },
    status: { type: String, enum: ['pending', 'connected', 'rejected'], default: 'pending' },
    message: { type: String, default: '' },
    matchScore: { type: Number, default: 0 }
}, {
    timestamps: true
});

module.exports = mongoose.model('Connection', ConnectionSchema);
