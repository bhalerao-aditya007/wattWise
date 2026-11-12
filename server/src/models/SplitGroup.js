const mongoose = require('mongoose');

const splitGroupSchema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true },
  household_id: { type: Number, required: true, index: true },
  name: { type: String, required: true },
  total_bill_amount: { type: Number, default: 0 },
  total_units: { type: Number, default: 0 },
  split_method: { type: String, default: 'equal' },
  members: [{
    id: { type: Number },
    name: { type: String },
    room_name: { type: String },
    room_id: { type: Number, default: null },
    measured_units: { type: Number, default: 0 },
    share_percentage: { type: Number, default: 0 },
    calculated_amount: { type: Number, default: 0 },
    status: { type: String, default: 'pending' }
  }]
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

splitGroupSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret.id || ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('SplitGroup', splitGroupSchema);
