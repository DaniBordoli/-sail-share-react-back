const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    boatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Boat', required: true, index: true },
    renterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // opcional por ahora

    startDate: { type: Date, required: true }, // inclusive
    endDate: { type: Date, required: true },   // exclusive
    guests: { type: Number, required: true, min: 1 },

    extras: {
      captain: { type: Boolean, default: false },
      fuel: { type: Boolean, default: false },
    },

    // Preferencias de reserva
    rentalType: {
      type: String,
      enum: ['boat_only', 'with_captain', 'owner_onboard'],
      default: 'boat_only',
    },
    flexibleCancellation: { type: Boolean, default: false },

    currency: { type: String, default: 'EUR' },
    totalAmount: { type: Number, required: true, min: 0 },

    // Datos de pasajeros y contacto
    contactPhone: { type: String },
    hasChildren: { type: Boolean, default: false },

    // CV náutico
    sailingExperience: { type: String, enum: ['none','basic','intermediate','advanced'], default: 'none' },
    motorExperience: { type: String, enum: ['none','basic','intermediate','advanced'], default: 'none' },
    licenseType: { type: String },
    ownershipExperience: { type: String, enum: ['none','rented_before','owned_before'], default: 'none' },
    additionalDescription: { type: String },

    status: {
      type: String,
      enum: ['pending_payment', 'confirmed', 'cancelled'],
      default: 'pending_payment',
      index: true,
    },

    // mock de pago (simulación Stripe)
    paymentIntentId: { type: String },
    clientSecret: { type: String },
  },
  { timestamps: true }
);

// Índice para detectar solapamientos rápidamente por barco
BookingSchema.index({ boatId: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
