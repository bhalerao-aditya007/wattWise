const express = require('express');
const router = express.Router();
const { getStore } = require('../config/db');

// GET /api/v1/alerts/:householdId
router.get('/:householdId', (req, res) => {
  const store = getStore();
  const householdId = Number(req.params.householdId);
  const alerts = (store.alerts || []).filter(a => a.household_id === householdId);
  res.json({ alerts });
});

// PATCH /api/v1/alerts/:id/read
router.patch('/:id/read', (req, res) => {
  const store = getStore();
  const id = Number(req.params.id);
  const alert = (store.alerts || []).find(a => a.id === id);
  if (!alert) {
    return res.status(404).json({ error: { message: 'Alert not found' } });
  }

  alert.is_read = true;
  res.json({ success: true, alert });
});

// POST /api/v1/alerts
router.post('/', (req, res) => {
  const store = getStore();
  const { household_id = 1, alert_type, type, title, message, severity } = req.body;

  const newAlert = {
    id: (store.alerts || []).length + 1,
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

  res.status(201).json({ success: true, alert: newAlert });
});

module.exports = router;
