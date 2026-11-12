const express = require('express');
const router = express.Router();
const { getStore, isUsingMongo, models } = require('../config/db');

// GET /api/v1/split/groups/:householdId
router.get('/groups/:householdId', async (req, res) => {
  const store = getStore();
  const householdId = Number(req.params.householdId);

  let groups = (store.splitGroups || []).filter(g => g.household_id === householdId);

  if (isUsingMongo() && models.SplitGroup) {
    try {
      const dbGroups = await models.SplitGroup.find({ household_id: householdId });
      if (dbGroups.length > 0) {
        groups = dbGroups.map(g => g.toJSON());
      }
    } catch (err) {
      console.warn('[Split] MongoDB fetch warning:', err.message);
    }
  }

  res.json({ groups });
});

// POST /api/v1/split/groups
router.post('/groups', async (req, res) => {
  const store = getStore();
  const {
    household_id = 1,
    name = 'Roommates Flat Split',
    total_bill_amount = 3000,
    total_units = 250,
    split_method = 'equal',
    members = []
  } = req.body;

  let nextId = (store.splitGroups || []).length > 0 ? Math.max(...store.splitGroups.map(g => g.id)) + 1 : 1;

  if (isUsingMongo() && models.SplitGroup) {
    try {
      const maxGroup = await models.SplitGroup.findOne().sort({ id: -1 });
      if (maxGroup && maxGroup.id >= nextId) nextId = maxGroup.id + 1;
    } catch (e) {
      console.warn('[Split] ID resolution warning:', e.message);
    }
  }

  const newGroup = {
    id: nextId,
    household_id: Number(household_id) || 1,
    name,
    total_bill_amount: Number(total_bill_amount) || 0,
    total_units: Number(total_units) || 0,
    split_method,
    members: members.map((m, idx) => ({
      id: idx + 1,
      name: m.name || `Member ${idx + 1}`,
      room_name: m.room_name || `Room ${idx + 1}`,
      room_id: m.room_id || null,
      measured_units: Number(m.measured_units) || 0,
      share_percentage: Number(m.share_percentage) || 0,
      calculated_amount: Number(m.calculated_amount) || 0,
      status: m.status || 'pending'
    }))
  };

  if (!store.splitGroups) store.splitGroups = [];
  store.splitGroups.push(newGroup);

  if (isUsingMongo() && models.SplitGroup) {
    try {
      await models.SplitGroup.create(newGroup);
    } catch (err) {
      console.warn('[Split] MongoDB create warning:', err.message);
    }
  }

  res.status(201).json({ success: true, group: newGroup });
});

// GET /api/v1/split/groups/:groupId/calculate
router.get('/groups/:groupId/calculate', async (req, res) => {
  const store = getStore();
  const groupId = Number(req.params.groupId);
  let group = (store.splitGroups || []).find(g => g.id === groupId);

  if (!group && isUsingMongo() && models.SplitGroup) {
    try {
      const dbGroup = await models.SplitGroup.findOne({ id: groupId });
      if (dbGroup) group = dbGroup.toJSON();
    } catch (err) {
      console.warn('[Split] MongoDB find warning:', err.message);
    }
  }

  if (!group) {
    return res.status(404).json({ error: { message: 'Split group not found' } });
  }

  const numMembers = group.members.length || 1;
  const totalAmount = Number(group.total_bill_amount) || 0;
  const totalUnits = Number(group.total_units) || 0;

  if (group.split_method === 'equal') {
    const sharePct = Number((100 / numMembers).toFixed(2));
    const amountPerMember = Number((totalAmount / numMembers).toFixed(2));
    const unitsPerMember = Number((totalUnits / numMembers).toFixed(2));

    group.members.forEach(m => {
      m.share_percentage = sharePct;
      m.calculated_amount = amountPerMember;
      m.measured_units = unitsPerMember;
    });
  } else if (group.split_method === 'measured' || group.split_method === 'by_room') {
    const sumMeasured = group.members.reduce((acc, m) => acc + (Number(m.measured_units) || 1), 0);
    group.members.forEach(m => {
      const units = Number(m.measured_units) || 1;
      const pct = (units / (sumMeasured || 1)) * 100;
      m.share_percentage = Number(pct.toFixed(2));
      m.calculated_amount = Number(((pct / 100) * totalAmount).toFixed(2));
    });
  }

  if (isUsingMongo() && models.SplitGroup) {
    models.SplitGroup.findOneAndUpdate({ id: groupId }, { members: group.members })
      .catch(e => console.warn('[Split] Save calculate warning:', e.message));
  }

  res.json({
    success: true,
    group,
    total_bill_amount: totalAmount,
    total_units: totalUnits,
    members: group.members
  });
});

module.exports = router;
