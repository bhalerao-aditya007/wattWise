const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true },
  household_id: { type: Number, required: true, index: true },
  alert_type: { type: String, default: 'tip' },
  type: { type: String, default: 'tip' },
  severity: { type: String, default: 'info' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  is_read: { type: Boolean, default: false }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

alertSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret.id || ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Alert', alertSchema);
