// Must run first so SMTP etc. are in process.env when email.js and other modules load
import './src/loadEnv.js';

import connectDB from './src/config/db.js';
import { seedFacilitiesIfEmpty } from './src/scripts/seedFacilitiesIfEmpty.js';
import app from './app.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    console.log('🚀 Starting server...');
    
    // Connect to database
    await connectDB();
    // Seed facilities if collection is empty (same list as frontend, fixed reference data)
    await seedFacilitiesIfEmpty();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
     
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
