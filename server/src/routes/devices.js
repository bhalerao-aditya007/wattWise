const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { getStore, isUsingMongo, models } = require('../config/db');

// GET /api/v1/devices/:householdId
router.get('/:householdId', async (req, res) => {
  const store = getStore();
  const householdId = Number(req.params.householdId);

  let householdDevices = store.devices.filter(d => d.household_id === householdId);

  if (isUsingMongo() && models.Device) {
    try {
      const dbDevices = await models.Device.find({ household_id: householdId });
      if (dbDevices.length > 0) {
        householdDevices = dbDevices.map(d => d.toJSON());
      }
    } catch (err) {
      console.warn('[Devices] MongoDB fetch warning:', err.message);
    }
  }

  // Enrich with appliance name
  const enriched = householdDevices.map(d => {
    const appliance = store.appliances.find(a => a.id === d.appliance_id);
    return {
      ...d,
      device_name: d.name || d.device_name,
      device_kind: d.kind || d.device_kind || 'smart_plug',
      linked_appliance_name: appliance ? appliance.custom_name : (d.linked_appliance_name || null)
    };
  });

  res.json({ devices: enriched });
});

// POST /api/v1/devices
router.post('/', async (req, res) => {
  const store = getStore();
  const { household_id = 1, name, device_name, kind, device_kind = 'smart_plug', appliance_id } = req.body;
  const rawToken = 'ww_live_' + crypto.randomBytes(16).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  let nextId = store.devices.length > 0 ? Math.max(...store.devices.map(d => d.id)) + 1 : 1;

  if (isUsingMongo() && models.Device) {
    try {
      const maxDevice = await models.Device.findOne().sort({ id: -1 });
      if (maxDevice && maxDevice.id >= nextId) nextId = maxDevice.id + 1;
    } catch (e) {
      console.warn('[Devices] ID resolution warning:', e.message);
    }
  }

  const newDevice = {
    id: nextId,
    household_id: Number(household_id) || 1,
    appliance_id: appliance_id ? Number(appliance_id) : null,
    kind: kind || device_kind || 'smart_plug',
    name: name || device_name || `Smart Device ${nextId}`,
    token_hash: tokenHash,
    token: rawToken, // returned once upon creation
    last_seen: new Date().toISOString(),
    is_active: true
  };

  store.devices.push(newDevice);

  if (isUsingMongo() && models.Device) {
    try {
      await models.Device.create(newDevice);
    } catch (err) {
      console.warn('[Devices] MongoDB insert warning:', err.message);
    }
  }

  res.status(201).json({
    success: true,
    device: newDevice,
    token: rawToken
  });
});

// PATCH /api/v1/devices/:id
router.patch('/:id', async (req, res) => {
  const store = getStore();
  const id = Number(req.params.id);
  const idx = store.devices.findIndex(d => d.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: { message: 'Device not found' } });
  }

  const { appliance_id, name, kind, is_active } = req.body;
  if (appliance_id !== undefined) store.devices[idx].appliance_id = appliance_id ? Number(appliance_id) : null;
  if (name !== undefined) store.devices[idx].name = name;
  if (kind !== undefined) store.devices[idx].kind = kind;
  if (is_active !== undefined) store.devices[idx].is_active = is_active;
  store.devices[idx].last_seen = new Date().toISOString();

  if (isUsingMongo() && models.Device) {
    try {
      await models.Device.findOneAndUpdate({ id }, { ...req.body, last_seen: new Date().toISOString() });
    } catch (err) {
      console.warn('[Devices] MongoDB update warning:', err.message);
    }
  }

  res.json({ success: true, device: store.devices[idx] });
});

// DELETE /api/v1/devices/:id
router.delete('/:id', async (req, res) => {
  const store = getStore();
  const id = Number(req.params.id);
  store.devices = store.devices.filter(d => d.id !== id);

  if (isUsingMongo() && models.Device) {
    try {
      await models.Device.deleteOne({ id });
    } catch (err) {
      console.warn('[Devices] MongoDB delete warning:', err.message);
    }
  }

  res.json({ success: true, message: 'Device removed successfully' });
});

module.exports = router;
