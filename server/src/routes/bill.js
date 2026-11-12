const express = require('express');
const router = express.Router();
const { calculateBill, auditBill } = require('../services/billEngine');
const { getStore, isUsingMongo, models } = require('../config/db');

// POST /api/v1/bills/calculate
router.post('/calculate', (req, res) => {
  const { units, billingDays, tariff } = req.body;
  if (units === undefined || units === null) {
    return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'units parameter is required' } });
  }

  const breakdown = calculateBill(units, tariff, billingDays);
  res.json(breakdown);
});

// POST /api/v1/bills/audit
router.post('/audit', async (req, res) => {
  const { units, amount, billMonth, householdId } = req.body;
  if (units === undefined || amount === undefined) {
    return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Both units and amount are required' } });
  }

  const auditResult = auditBill(units, amount);
  const store = getStore();

  // If householdId is provided, store the audited bill in history
  if (householdId) {
    const nextId = store.bills.length > 0 ? Math.max(...store.bills.map(b => b.id)) + 1 : 1;
    const newBill = {
      id: nextId,
      household_id: Number(householdId),
      bill_month: billMonth || new Date().toISOString().slice(0, 7),
      units_billed: Number(units),
      amount_billed: Number(amount),
      amount_recomputed: auditResult.amountRecomputed,
      mismatch_flag: auditResult.isMismatch,
      mismatch_reason: auditResult.mismatchReason
    };
    store.bills.push(newBill);

    if (isUsingMongo() && models.Bill) {
      try {
        await models.Bill.findOneAndUpdate(
          { household_id: newBill.household_id, bill_month: newBill.bill_month },
          newBill,
          { upsert: true, new: true }
        );
      } catch (err) {
        console.warn('[Bills] MongoDB save warning:', err.message);
      }
    }
  }

  res.json(auditResult);
});

// GET /api/v1/bills/history/:householdId
router.get('/history/:householdId', async (req, res) => {
  const store = getStore();
  const householdId = Number(req.params.householdId);

  let bills = store.bills.filter(b => b.household_id === householdId);

  if (isUsingMongo() && models.Bill) {
    try {
      const dbBills = await models.Bill.find({ household_id: householdId }).sort({ bill_month: -1 });
      if (dbBills.length > 0) {
        bills = dbBills.map(b => b.toJSON());
      }
    } catch (err) {
      console.warn('[Bills] MongoDB history fetch warning:', err.message);
    }
  }

  res.json({ bills });
});

module.exports = router;
