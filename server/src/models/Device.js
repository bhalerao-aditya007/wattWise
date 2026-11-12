const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true },
  household_id: { type: Number, required: true, index: true },
  appliance_id: { type: Number, default: null },
  kind: { type: String, default: 'smart_plug' },
  name: { type: String, required: true },
  token_hash: { type: String },
  last_seen: { type: String, default: null },
  is_active: { type: Boolean, default: true }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

deviceSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret.id || ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Device', deviceSchema);
