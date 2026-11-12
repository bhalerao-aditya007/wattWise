const express = require('express');
const router = express.Router();
const { getStore, isUsingMongo, models } = require('../config/db');

// GET /api/v1/alerts/:householdId
router.get('/:householdId', async (req, res) => {
  const store = getStore();
  const householdId = Number(req.params.householdId);

  let alerts = (store.alerts || []).filter(a => a.household_id === householdId);

  if (isUsingMongo() && models.Alert) {
    try {
      const dbAlerts = await models.Alert.find({ household_id: householdId }).sort({ id: -1 });
      if (dbAlerts.length > 0) {
        alerts = dbAlerts.map(a => a.toJSON());
      }
    } catch (err) {
      console.warn('[Alerts] MongoDB fetch warning:', err.message);
    }
  }

  res.json({ alerts });
});

// PATCH /api/v1/alerts/:id/read
router.patch('/:id/read', async (req, res) => {
  const store = getStore();
  const id = Number(req.params.id);
  const alert = (store.alerts || []).find(a => a.id === id);

  if (!alert) {
    return res.status(404).json({ error: { message: 'Alert not found' } });
  }

  alert.is_read = true;

  if (isUsingMongo() && models.Alert) {
    try {
      await models.Alert.findOneAndUpdate({ id }, { is_read: true });
    } catch (err) {
      console.warn('[Alerts] MongoDB update warning:', err.message);
    }
  }

  res.json({ success: true, alert });
});

// POST /api/v1/alerts
router.post('/', async (req, res) => {
  const store = getStore();
  const { household_id = 1, alert_type, type, title, message, severity } = req.body;

  let nextId = (store.alerts || []).length > 0 ? Math.max(...store.alerts.map(a => a.id)) + 1 : 1;

  if (isUsingMongo() && models.Alert) {
    try {
      const maxAlert = await models.Alert.findOne().sort({ id: -1 });
      if (maxAlert && maxAlert.id >= nextId) nextId = maxAlert.id + 1;
    } catch (e) {
      console.warn('[Alerts] ID resolution warning:', e.message);
    }
  }

  const newAlert = {
    id: nextId,
    household_id: Number(household_id) || 1,
    alert_type: alert_type || type || 'tip',
    type: alert_type || type || 'tip',
    severity: severity || 'info',
    title: title || 'WattWise Notification',
    message: message || '',
    is_read: false,
    created_at: new Date().toISOString()
  };

  if (!store.alerts) store.alerts = [];
  store.alerts.unshift(newAlert);

  if (isUsingMongo() && models.Alert) {
    try {
      await models.Alert.create(newAlert);
    } catch (err) {
      console.warn('[Alerts] MongoDB insert warning:', err.message);
    }
  }

  res.status(201).json({ success: true, alert: newAlert });
});

module.exports = router;
