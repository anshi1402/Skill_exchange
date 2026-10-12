const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    type: { type: String, default: 'info' },
    title: { type: String, default: '' },
    message: { type: String, required: true },
    read: { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', NotificationSchema);
