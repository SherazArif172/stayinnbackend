/**
 * Seed facilities collection with the same facilities as the frontend.
 * Run manually: npm run seed-facilities
 */
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import { seedFacilitiesIfEmpty } from './seedFacilitiesIfEmpty.js';

dotenv.config();

const run = async () => {
  try {
    await connectDB();
    const seeded = await seedFacilitiesIfEmpty();
    console.log(seeded ? 'Facilities seed complete.' : 'Facilities already present. Skipping.');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

run();
