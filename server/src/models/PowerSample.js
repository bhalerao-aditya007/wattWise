const mongoose = require('mongoose');

const powerSampleSchema = new mongoose.Schema({
  device_id: { type: Number, required: true, index: true },
  watts: { type: Number, required: true },
  voltage: { type: Number, default: null },
  current_amps: { type: Number, default: null },
  ts: { type: Date, default: Date.now, index: true }
});

powerSampleSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('PowerSample', powerSampleSchema);
