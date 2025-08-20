const mongoose = require('mongoose');

const BoatSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    // Datos principales
    name: { type: String, required: true, trim: true },
    rentalTypes: { type: [String], default: [] }, // ['solo_barco','con_capitan','con_dueno']
    area: { type: String, required: true },
    boatType: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    buildYear: { type: Number, required: true },
    capacity: { type: Number, required: true, min: 1 },
    enginePower: { type: Number, required: true, min: 0 },
    length: { type: Number, required: true, min: 0 },
    contactNumber: { type: String, required: true },
    city: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    priceUnit: { type: String, enum: ['day', 'week'], default: 'day' },

    photos: { type: [String], validate: [(arr) => arr.length > 0, 'At least one photo required'] },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Boat', BoatSchema);
