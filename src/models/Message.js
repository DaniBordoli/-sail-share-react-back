const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    boatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Boat', required: true, index: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },

    status: { type: String, enum: ['sent', 'delivered', 'failed'], default: 'sent' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', MessageSchema);
