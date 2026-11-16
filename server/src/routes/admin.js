const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { getStore, isUsingMongo, models } = require('../config/db');

// GET /api/v1/admin/db-health
router.get('/db-health', async (req, res) => {
  const store = getStore();
  const mongoConnected = isUsingMongo() && mongoose.connection.readyState === 1;
  let latencyMs = 0;
  const collectionCounts = {};

  if (mongoConnected) {
    try {
      const pingStart = Date.now();
      await mongoose.connection.db.admin().ping();
      latencyMs = Date.now() - pingStart;

      for (const [name, model] of Object.entries(models)) {
        try {
          collectionCounts[name] = await model.countDocuments();
        } catch (e) {
          collectionCounts[name] = 0;
        }
      }
    } catch (e) {
      console.warn('[DB Health] Ping warning:', e.message);
    }
  } else {
    collectionCounts.users = store.users.length;
    collectionCounts.households = store.households.length;
    collectionCounts.appliances = store.appliances.length;
    collectionCounts.bills = store.bills.length;
    collectionCounts.meterreadings = store.readings.length;
    collectionCounts.devices = store.devices.length;
    collectionCounts.alerts = store.alerts.length;
    collectionCounts.splitgroups = store.splitGroups.length;
  }

  res.json({
    status: 'ok',
    database: {
      type: mongoConnected ? 'MongoDB Atlas (Live Cloud Cluster)' : 'Dual-Mode In-Memory Fallback',
      isConnected: mongoConnected,
      readyState: mongoose.connection.readyState, // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
      readyStateText: mongoConnected ? 'Active & Connected' : 'In-Memory Mode (No Atlas URI)',
      host: mongoConnected ? (mongoose.connection.host || 'cluster0.2dbjxwm.mongodb.net') : 'localhost (in-memory)',
      name: mongoConnected ? mongoose.connection.name : 'in-memory-store',
      latencyMs: mongoConnected ? latencyMs : 0,
      checkedAt: new Date().toISOString()
    },
    collectionCounts,
    sampleDocuments: {
      households: store.households.slice(0, 4).map(h => ({ id: h.id, name: h.name, archetype: h.archetype, load: `${h.sanctioned_load_kw} kW` })),
      meterReadingsCount: store.readings.length,
      appliancesCount: store.appliances.length
    }
  });
});

// GET /api/v1/admin/stats
router.get('/stats', async (req, res) => {
  const store = getStore();

  let totalHouseholds = store.households.length;
  let totalAppliances = store.appliances.length;
  let totalBillsAudited = store.bills.length;
  let mismatchedBills = store.bills.filter(b => b.mismatch_flag).length;
  let bills = store.bills;

  if (isUsingMongo() && models.Household && models.Appliance && models.Bill) {
    try {
      const [hCount, aCount, bList] = await Promise.all([
        models.Household.countDocuments(),
        models.Appliance.countDocuments(),
        models.Bill.find().sort({ bill_month: -1 })
      ]);
      if (hCount > 0) totalHouseholds = hCount;
      if (aCount > 0) totalAppliances = aCount;
      if (bList.length > 0) {
        bills = bList.map(b => b.toJSON());
        totalBillsAudited = bills.length;
        mismatchedBills = bills.filter(b => b.mismatch_flag).length;
      }
    } catch (err) {
      console.warn('[Admin] MongoDB stats warning:', err.message);
    }
  }

  const auditMismatchRate = totalBillsAudited > 0 ? Number(((mismatchedBills / totalBillsAudited) * 100).toFixed(1)) : 0;

  // Breakdown by archetype
  const archetypeDistribution = {};
  store.households.forEach(h => {
    archetypeDistribution[h.archetype] = (archetypeDistribution[h.archetype] || 0) + 1;
  });

  // Top consuming appliance categories in catalog
  const applianceCategories = {};
  store.appliances.forEach(a => {
    applianceCategories[a.category] = (applianceCategories[a.category] || 0) + 1;
  });

  res.json({
    summary: {
      totalHouseholds,
      totalAppliances,
      totalBillsAudited,
      mismatchedBills,
      auditMismatchRatePercent: auditMismatchRate,
      activeTariff: 'MSEDCL Residential LT-I (FY 2024-25)',
      database: isUsingMongo() ? 'MongoDB Atlas (Connected)' : 'In-Memory Store (Active)'
    },
    archetypeDistribution,
    applianceCategories,
    bills
  });
});

module.exports = router;
