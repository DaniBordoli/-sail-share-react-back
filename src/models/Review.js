const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    boatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Boat', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

ReviewSchema.index({ boatId: 1, createdAt: -1 });

module.exports = mongoose.model('Review', ReviewSchema);
