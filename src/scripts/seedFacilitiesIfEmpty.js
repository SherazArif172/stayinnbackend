/**
 * Seed facilities if the collection is empty. Safe to call on every server start.
 * Used by server.js so facilities are always present in the DB.
 */
import Facility from '../models/Facility.js';

const FACILITIES = [
  { id: 'wifi', name: 'High-Speed WiFi', description: 'Free unlimited high-speed internet access throughout the premises', icon: 'wifi', isAvailable: true, color: 'text-primary', order: 1 },
  { id: 'laundry', name: 'Laundry Service', description: 'Self-service washing machines and dryers available 24/7', icon: 'laundry', isAvailable: true, color: 'text-stat-residents', order: 2 },
  { id: 'kitchen', name: 'Mess / Kitchen', description: 'Fully equipped communal kitchen with dining area', icon: 'kitchen', isAvailable: true, color: 'text-accent', order: 3 },
  { id: 'security', name: '24/7 Security', description: 'Round-the-clock security with CCTV surveillance', icon: 'security', isAvailable: true, color: 'text-stat-available', order: 4 },
  { id: 'parking', name: 'Parking Area', description: "Secure parking space for residents' vehicles", icon: 'parking', isAvailable: false, color: 'text-muted-foreground', order: 5 },
  { id: 'gym', name: 'Fitness Center', description: 'Well-equipped gym with modern exercise equipment', icon: 'gym', isAvailable: true, color: 'text-stat-occupied', order: 6 },
  { id: 'cafe', name: 'Common Lounge', description: 'Comfortable lounge area with TV and coffee machine', icon: 'cafe', isAvailable: true, color: 'text-primary', order: 7 },
  { id: 'ac', name: 'Air Conditioning', description: 'Climate control in all rooms and common areas', icon: 'ac', isAvailable: true, color: 'text-stat-rooms', order: 8 },
];

export async function seedFacilitiesIfEmpty() {
  const count = await Facility.countDocuments();
  if (count > 0) return false;
  await Facility.insertMany(FACILITIES);
  console.log(`Seeded ${FACILITIES.length} facilities.`);
  return true;
}
