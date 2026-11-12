const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true },
  household_id: { type: Number, required: true, index: true },
  name: { type: String, required: true },
  room_type: { type: String, default: 'Living Room' },
  width_m: { type: Number, default: 4.0 },
  length_m: { type: Number, default: 4.0 }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

roomSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret.id || ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Room', roomSchema);
