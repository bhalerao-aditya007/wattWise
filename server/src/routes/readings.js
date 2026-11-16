const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { forecastMonthEnd } = require('../services/forecast');
const { getStore, isUsingMongo, models } = require('../config/db');
const { simulateHousehold } = require('../services/simEngine');

// Helper to load CSV readings by relative filename
function loadCsvReadings(filename) {
  const csvPath = path.join(__dirname, '..', '..', '..', 'data', filename);
  if (!fs.existsSync(csvPath)) return null;

  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.trim().split('\n').slice(1);
  return lines.map(line => {
    const [date, units] = line.split(',');
    return {
      reading_date: date.trim(),
      daily_units: parseFloat(units.trim())
    };
  }).filter(r => !isNaN(r.daily_units));
}

// GET /api/v1/readings?source=demo|simulated|real|sgcc_normal|sgcc_theft&householdId=1
router.get('/', async (req, res) => {
  const source = req.query.source || 'demo';
  const householdId = Number(req.query.householdId) || 1;
  const store = getStore();

  const household = store.households.find(h => h.id === householdId) || store.households[0];

  let readingsData = [];
  let datasetLabel = `Seeded Profile (${household.name})`;
  let simDetails = null;

  if (source === 'simulated') {
    // Dynamic physics-grounded simulation for the active household
    const appliances = store.appliances.filter(a => a.household_id === householdId);
    const rooms = store.rooms.filter(r => r.household_id === householdId);
    const enrichedAppliances = appliances.map(app => {
      const r = rooms.find(room => room.id === app.room_id);
      return { ...app, room_name: r ? r.name : 'General' };
    });

    const ambientTempC = Number(req.query.ambientTempC) || 34;
    const acSetpointC = Number(req.query.acSetpointC) || 24;

    simDetails = simulateHousehold(enrichedAppliances, {
      ambientTempC,
      acSetpointC,
      days: 30
    });

    readingsData = simDetails.dailySeries.map(ds => {
      const dayStr = String(ds.day).padStart(2, '0');
      return {
        reading_date: `2024-10-${dayStr}`,
        daily_units: ds.kwh
      };
    });

    datasetLabel = `Physics Simulation Engine (${household.archetype} · ${ambientTempC}°C ambient, ${acSetpointC}°C AC)`;
  } else if (source === 'demo') {
    // Specific household readings from Mongo or store
    let found = false;
    if (isUsingMongo() && models.MeterReading) {
      try {
        const dbReadings = await models.MeterReading.find({ household_id: householdId }).sort({ reading_date: 1 });
        if (dbReadings.length > 0) {
          readingsData = dbReadings.map(r => ({ reading_date: r.reading_date, daily_units: r.daily_units }));
          found = true;
        }
      } catch (err) {
        console.warn('[Readings] MongoDB fetch warning:', err.message);
      }
    }

    if (!found) {
      readingsData = store.readings.filter(r => r.household_id === householdId);
    }

    // Fallback if none found
    if (!readingsData || readingsData.length === 0) {
      readingsData = store.readings.filter(r => r.household_id === 1);
    }

    datasetLabel = `Profile (${household.name})`;
  } else if (source === 'real') {
    const realData = loadCsvReadings('real_daily_readings.csv');
    if (realData && realData.length > 0) {
      readingsData = realData.slice(0, 30);
      datasetLabel = 'Real Measured Household Power Dataset (UCI Benchmark)';
    }
  } else if (source === 'sgcc_normal') {
    const normalData = loadCsvReadings('sgcc_normal_daily.csv');
    if (normalData && normalData.length > 0) {
      readingsData = normalData;
      datasetLabel = 'Kaggle SGCC Normal Consumer (23,741 Benchmark Sample)';
    }
  } else if (source === 'sgcc_theft') {
    const theftData = loadCsvReadings('sgcc_theft_daily.csv');
    if (theftData && theftData.length > 0) {
      readingsData = theftData;
      datasetLabel = 'Kaggle SGCC Flagged Theft/Anomaly Consumer (2,122 Benchmark Sample)';
    }
  }

  const forecast = forecastMonthEnd(readingsData, 30);
  res.json({
    source,
    householdId,
    datasetLabel,
    readings: readingsData,
    forecast,
    simulation: simDetails
  });
});

// POST /api/v1/readings
router.post('/', async (req, res) => {
  const { reading_date, daily_units, household_id } = req.body;
  if (!reading_date || daily_units === undefined) {
    return res.status(400).json({ error: { message: 'reading_date and daily_units are required' } });
  }

  const hId = Number(household_id) || 1;
  const store = getStore();
  const newReading = {
    household_id: hId,
    reading_date,
    daily_units: Number(daily_units)
  };

  // Upsert or push in store
  const existingIndex = store.readings.findIndex(r => r.household_id === hId && r.reading_date === reading_date);
  if (existingIndex >= 0) {
    store.readings[existingIndex] = newReading;
  } else {
    store.readings.push(newReading);
  }

  if (isUsingMongo() && models.MeterReading) {
    try {
      await models.MeterReading.findOneAndUpdate(
        { household_id: newReading.household_id, reading_date: newReading.reading_date },
        newReading,
        { upsert: true, new: true }
      );
    } catch (err) {
      console.warn('[Readings] MongoDB save warning:', err.message);
    }
  }

  const hhReadings = store.readings.filter(r => r.household_id === hId);
  const updatedForecast = forecastMonthEnd(hhReadings.length > 0 ? hhReadings : store.readings, 30);

  res.status(201).json({
    success: true,
    reading: newReading,
    forecast: updatedForecast
  });
});

module.exports = router;
