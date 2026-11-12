const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true },
  household_id: { type: Number, required: true, index: true },
  bill_month: { type: String, required: true },
  period_start: { type: String },
  period_end: { type: String },
  units_billed: { type: Number, required: true },
  amount_billed: { type: Number, required: true },
  amount_recomputed: { type: Number, required: true },
  mismatch_flag: { type: Boolean, default: false },
  mismatch_reason: { type: String, default: null },
  breakdown: { type: mongoose.Schema.Types.Mixed, default: {} }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

billSchema.index({ household_id: 1, bill_month: 1 }, { unique: true });

billSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret.id || ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Bill', billSchema);
