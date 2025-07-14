import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema({
    to: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    attachment: {
        filename: String,
        path: String,
        mimetype: String,
        size: Number,
    },
    sentAt: {
        type: Date
    },
    scheduledAt: {
        type: Date
    },
    status: {
        type: String,
        enum: ['scheduled', 'sent', 'failed'],
        default: 'scheduled',
    },
});

export default mongoose.model('Email', emailSchema);
