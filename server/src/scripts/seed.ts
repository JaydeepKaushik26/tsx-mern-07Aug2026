import bcrypt from 'bcryptjs';
import { connectDb, disconnectDb } from '../db/connect.js';
import { User } from '../models/User.js';

const DEMO_USERNAME = 'lukeskywalker';
const DEMO_PASSWORD = 'force123';

async function seed() {
  await connectDb();

  const existing = await User.findOne({ username: DEMO_USERNAME });
  if (existing) {
    console.log(`ℹ️  Demo user "${DEMO_USERNAME}" already exists, skipping.`);
  } else {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
    await User.create({ username: DEMO_USERNAME, passwordHash });
    console.log(`✅ Created demo user "${DEMO_USERNAME}" / "${DEMO_PASSWORD}"`);
  }

  await disconnectDb();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
