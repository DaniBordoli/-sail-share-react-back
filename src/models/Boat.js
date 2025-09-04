const mongoose = require('mongoose');

const BoatSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    // Datos principales
    name: { type: String, required: true, trim: true },
    rentalTypes: { type: [String], default: [] }, // ['solo_barco','con_capitan','con_dueno']
    area: { type: String },
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

    // Equipamiento / comodidades (opcional)
    amenities: { type: [String], default: [] },

    // Políticas opcionales
    allowsFlexibleCancellation: { type: Boolean, default: false },

    // Condiciones de alquiler (opcional)
    rentalConditions: {
      cancellationPolicy: { type: String, trim: true, default: '' },
      deposit: { type: Number, min: 0, default: 0 },
      checkInTime: { type: String, trim: true, default: '' },
      checkOutTime: { type: String, trim: true, default: '' },
      licenseRequired: { type: Boolean, default: false },
      includes: { type: [String], default: [] },
      notIncluded: { type: [String], default: [] },
    },

    // Geolocalización
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
    addressFormatted: { type: String, required: true, trim: true },

    // GeoJSON point para consultas geoespaciales
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lon, lat]
        validate: {
          validator: function (v) {
            return Array.isArray(v) && v.length === 2 && v.every((n) => typeof n === 'number');
          },
          message: 'coordinates inválidas',
        },
      },
    },

    // Publicación / estado
    isActive: { type: Boolean, default: true },
    status: { type: String, enum: ['draft','pending_review','approved','rejected'], default: 'draft', index: true },
    submittedAt: { type: Date },
    reviewedAt: { type: Date },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewNotes: { type: String },
    audit: [
      {
        action: { type: String, enum: ['submit','approve','reject'], required: true },
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        at: { type: Date, default: Date.now },
        notes: { type: String },
      },
    ],
  },
  { timestamps: true }
);

// Índice 2dsphere para campo GeoJSON
BoatSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Boat', BoatSchema);
