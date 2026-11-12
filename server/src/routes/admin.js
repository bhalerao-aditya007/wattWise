const express = require('express');
const router = express.Router();
const { getStore, isUsingMongo, models } = require('../config/db');

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
