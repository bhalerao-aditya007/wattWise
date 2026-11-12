const mongoose = require('mongoose');

const meterReadingSchema = new mongoose.Schema({
  id: { type: Number, unique: true, sparse: true },
  household_id: { type: Number, default: 1, index: true },
  reading_date: { type: String, required: true },
  daily_units: { type: Number, required: true },
  cumulative_kwh: { type: Number, default: 0 },
  source: { type: String, enum: ['manual', 'estimated', 'simulated'], default: 'manual' }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

meterReadingSchema.index({ household_id: 1, reading_date: 1 });

meterReadingSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret.id || ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('MeterReading', meterReadingSchema);
