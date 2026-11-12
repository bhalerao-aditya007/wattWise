const mongoose = require('mongoose');

const applianceSchema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true },
  household_id: { type: Number, required: true, index: true },
  room_id: { type: Number, default: null },
  catalog_id: { type: Number, default: 1 },
  custom_name: { type: String, required: true },
  rated_w: { type: Number, required: true },
  standby_w: { type: Number, default: 0.0 },
  bee_star_rating: { type: Number, default: 3 },
  daily_hours_guess: { type: Number, default: 4.0 },
  model_kind: {
    type: String,
    enum: ['constant', 'scheduled', 'cyclic', 'thermostatic', 'per_cycle', 'variable'],
    default: 'scheduled'
  },
  category: { type: String, default: 'General' },
  pos_x: { type: Number, default: 0.0 },
  pos_y: { type: Number, default: 1.0 },
  pos_z: { type: Number, default: 0.0 },
  is_active: { type: Boolean, default: true }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

applianceSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret.id || ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Appliance', applianceSchema);
