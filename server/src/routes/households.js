const express = require('express');
const router = express.Router();
const { getStore, isUsingMongo, models } = require('../config/db');

// GET /api/v1/households
router.get('/', async (req, res) => {
  const store = getStore();

  if (isUsingMongo() && models.Household) {
    try {
      const dbHouseholds = await models.Household.find();
      if (dbHouseholds.length > 0) {
        store.households = dbHouseholds.map(h => h.toJSON());
      }
    } catch (err) {
      console.warn('[Households] MongoDB fetch warning:', err.message);
    }
  }

  res.json({ households: store.households });
});

// POST /api/v1/households
router.post('/', async (req, res) => {
  const store = getStore();
  const {
    name,
    state = 'Maharashtra',
    discom = 'MSEDCL',
    connection_type = 'Single Phase',
    category = 'Residential (LT-I)',
    sanctioned_load_kw = 3.0,
    archetype = '2BHK',
    last_bill_units,
    last_bill_amount,
    consumer_number
  } = req.body;

  let nextId = store.households.length > 0 ? Math.max(...store.households.map(h => h.id)) + 1 : 1;

  if (isUsingMongo() && models.Household) {
    try {
      const maxHh = await models.Household.findOne().sort({ id: -1 });
      if (maxHh && maxHh.id >= nextId) nextId = maxHh.id + 1;
    } catch (e) {
      console.warn('[Households] ID resolution warning:', e.message);
    }
  }

  const newHousehold = {
    id: nextId,
    user_id: 1,
    name: name || `Residence (${archetype}, ${state})`,
    state,
    discom,
    connection_type,
    category,
    tariff_id: 1,
    sanctioned_load_kw: Number(sanctioned_load_kw) || 3.0,
    billing_day: 1,
    archetype: archetype || '2BHK',
    consumer_number: consumer_number || '028540' + Math.floor(100000 + Math.random() * 900000)
  };

  store.households.push(newHousehold);

  if (isUsingMongo() && models.Household) {
    try {
      await models.Household.create(newHousehold);
    } catch (err) {
      console.warn('[Households] MongoDB create warning:', err.message);
    }
  }

  // If first bill info provided, audit and save to bills store
  if (last_bill_units && last_bill_amount) {
    try {
      const { auditBill } = require('../services/billEngine');
      const auditRes = auditBill(Number(last_bill_units), Number(last_bill_amount));
      const billId = store.bills.length > 0 ? Math.max(...store.bills.map(b => b.id)) + 1 : 1;
      const newBill = {
        id: billId,
        household_id: newHousehold.id,
        bill_month: new Date().toISOString().slice(0, 7),
        units_billed: Number(last_bill_units),
        amount_billed: Number(last_bill_amount),
        amount_recomputed: auditRes.amountRecomputed,
        mismatch_flag: auditRes.isMismatch,
        mismatch_reason: auditRes.mismatchReason
      };
      store.bills.push(newBill);
      newHousehold.baselineBill = newBill;
      newHousehold.auditResult = auditRes;

      if (isUsingMongo() && models.Bill) {
        models.Bill.create(newBill).catch(e => console.warn('[Households] Bill save warning:', e.message));
      }
    } catch (e) {
      console.warn('[Households] Could not audit baseline bill:', e.message);
    }
  }

  res.status(201).json({ success: true, household: newHousehold });
});

// GET /api/v1/households/:id
router.get('/:id', async (req, res) => {
  const store = getStore();
  const id = Number(req.params.id);

  let household = store.households.find(h => h.id === id) || store.households[0];
  let rooms = store.rooms.filter(r => r.household_id === household.id);
  let appliances = store.appliances.filter(a => a.household_id === household.id);

  if (isUsingMongo()) {
    try {
      if (models.Household) {
        const dbH = await models.Household.findOne({ id });
        if (dbH) household = dbH.toJSON();
      }
      if (models.Room) {
        const dbRooms = await models.Room.find({ household_id: household.id });
        if (dbRooms.length > 0) rooms = dbRooms.map(r => r.toJSON());
      }
      if (models.Appliance) {
        const dbApps = await models.Appliance.find({ household_id: household.id });
        if (dbApps.length > 0) appliances = dbApps.map(a => a.toJSON());
      }
    } catch (err) {
      console.warn('[Households] MongoDB fetch warning:', err.message);
    }
  }

  res.json({
    household,
    rooms,
    appliances
  });
});

// POST /api/v1/households/:id/appliances
router.post('/:id/appliances', async (req, res) => {
  const store = getStore();
  const householdId = Number(req.params.id);
  const { custom_name, rated_w, bee_star_rating, daily_hours_guess, model_kind, category, room_id, pos_x, pos_y, pos_z } = req.body;

  let nextId = store.appliances.length > 0 ? Math.max(...store.appliances.map(a => a.id)) + 1 : 1;

  if (isUsingMongo() && models.Appliance) {
    try {
      const maxApp = await models.Appliance.findOne().sort({ id: -1 });
      if (maxApp && maxApp.id >= nextId) nextId = maxApp.id + 1;
    } catch (e) {
      console.warn('[Households] Appliance ID lookup warning:', e.message);
    }
  }

  const newAppliance = {
    id: nextId,
    household_id: householdId,
    room_id: Number(room_id) || 1,
    catalog_id: 1,
    custom_name: custom_name || 'New Appliance',
    rated_w: Number(rated_w) || 100,
    standby_w: 1.0,
    bee_star_rating: Number(bee_star_rating) || 3,
    daily_hours_guess: Number(daily_hours_guess) || 4,
    model_kind: model_kind || 'scheduled',
    category: category || 'General',
    pos_x: Number(pos_x) || 0.0,
    pos_y: Number(pos_y) || 1.0,
    pos_z: Number(pos_z) || 0.0
  };

  store.appliances.push(newAppliance);

  if (isUsingMongo() && models.Appliance) {
    try {
      await models.Appliance.create(newAppliance);
    } catch (err) {
      console.warn('[Households] MongoDB appliance insert warning:', err.message);
    }
  }

  res.status(201).json({ appliance: newAppliance });
});

// PATCH /api/v1/households/:id/appliances/:appId
router.patch('/:id/appliances/:appId', async (req, res) => {
  const store = getStore();
  const appId = Number(req.params.appId);
  const index = store.appliances.findIndex(a => a.id === appId);

  if (index === -1) {
    return res.status(404).json({ error: { message: 'Appliance not found' } });
  }

  store.appliances[index] = { ...store.appliances[index], ...req.body };

  if (isUsingMongo() && models.Appliance) {
    try {
      await models.Appliance.findOneAndUpdate({ id: appId }, req.body);
    } catch (err) {
      console.warn('[Households] MongoDB appliance update warning:', err.message);
    }
  }

  res.json({ appliance: store.appliances[index] });
});

// DELETE /api/v1/households/:id/appliances/:appId
router.delete('/:id/appliances/:appId', async (req, res) => {
  const store = getStore();
  const appId = Number(req.params.appId);
  store.appliances = store.appliances.filter(a => a.id !== appId);

  if (isUsingMongo() && models.Appliance) {
    try {
      await models.Appliance.deleteOne({ id: appId });
    } catch (err) {
      console.warn('[Households] MongoDB appliance delete warning:', err.message);
    }
  }

  res.json({ success: true, message: 'Appliance removed' });
});

module.exports = router;
