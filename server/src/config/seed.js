const models = require('../models');

async function seedMongoDatabase(memoryStore) {
  try {
    const { User, Household, Room, Appliance, Bill, MeterReading, Alert, Device, SplitGroup } = models;

    // Check if database already has users
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`[DB] MongoDB Atlas already seeded (${userCount} users found). Skipping initial seed.`);
      return;
    }

    console.log('[DB] Seeding MongoDB Atlas collections with initial demo data...');

    // 1. Seed Users
    for (const u of memoryStore.users) {
      await User.findOneAndUpdate({ email: u.email }, u, { upsert: true, new: true });
    }

    // 2. Seed Households
    for (const h of memoryStore.households) {
      await Household.findOneAndUpdate({ id: h.id }, h, { upsert: true, new: true });
    }

    // 3. Seed Rooms
    for (const r of memoryStore.rooms) {
      await Room.findOneAndUpdate({ id: r.id }, r, { upsert: true, new: true });
    }

    // 4. Seed Appliances
    for (const a of memoryStore.appliances) {
      await Appliance.findOneAndUpdate({ id: a.id }, a, { upsert: true, new: true });
    }

    // 5. Seed Bills
    for (const b of memoryStore.bills) {
      await Bill.findOneAndUpdate({ household_id: b.household_id, bill_month: b.bill_month }, b, { upsert: true, new: true });
    }

    // 6. Seed Meter Readings
    for (let i = 0; i < memoryStore.readings.length; i++) {
      const r = memoryStore.readings[i];
      await MeterReading.findOneAndUpdate(
        { household_id: 1, reading_date: r.reading_date },
        { id: i + 1, household_id: 1, reading_date: r.reading_date, daily_units: r.daily_units, source: 'manual' },
        { upsert: true, new: true }
      );
    }

    // 7. Seed Devices
    for (const d of memoryStore.devices) {
      await Device.findOneAndUpdate({ id: d.id }, d, { upsert: true, new: true });
    }

    // 8. Seed Alerts
    for (const al of memoryStore.alerts) {
      await Alert.findOneAndUpdate({ id: al.id }, al, { upsert: true, new: true });
    }

    // 9. Seed Split Groups
    for (const sg of memoryStore.splitGroups) {
      await SplitGroup.findOneAndUpdate({ id: sg.id }, sg, { upsert: true, new: true });
    }

    console.log('✅ [DB] MongoDB Atlas successfully populated with all demo collections!');
  } catch (err) {
    console.error('[DB] Seeding error:', err.message);
  }
}

// Support running standalone: node src/config/seed.js
if (require.main === module) {
  require('dotenv').config();
  const mongoose = require('mongoose');
  const { memoryStore } = require('./db');
  
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set in .env');
    process.exit(1);
  }

  mongoose.connect(uri)
    .then(async () => {
      console.log('Connected to MongoDB Atlas for manual seed.');
      await seedMongoDatabase(memoryStore);
      await mongoose.disconnect();
      console.log('Disconnected.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Connection failed:', err.message);
      process.exit(1);
    });
}

module.exports = { seedMongoDatabase };
