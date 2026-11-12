const mongoose = require('mongoose');

const householdSchema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true },
  user_id: { type: Number, default: 1, index: true },
  name: { type: String, required: true },
  tariff_id: { type: Number, default: 1 },
  sanctioned_load_kw: { type: Number, default: 3.0 },
  billing_day: { type: Number, default: 1 },
  archetype: {
    type: String,
    enum: ['1BHK', '2BHK', '3BHK', 'PG_Flat', 'Independent_House'],
    default: '2BHK'
  },
  state: { type: String, default: 'Maharashtra' },
  discom: { type: String, default: 'MSEDCL' },
  connection_type: { type: String, default: 'Single Phase' },
  category: { type: String, default: 'Residential (LT-I)' },
  consumer_number: { type: String },
  floor_plan: { type: mongoose.Schema.Types.Mixed, default: null }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

householdSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret.id || ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Household', householdSchema);
