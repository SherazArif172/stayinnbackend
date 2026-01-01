import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    let mongoURI = process.env.MONGODB_URI;
    
    // Trim whitespace and validate
    if (mongoURI) {
      mongoURI = mongoURI.trim();
    }
    
    if (!mongoURI) {
      console.warn('⚠️  MONGODB_URI not found in environment variables. Using default local connection.');
      mongoURI = 'mongodb://localhost:27017/stayinn-hostels';
    } else {
      if (!mongoURI.startsWith('mongodb://') && !mongoURI.startsWith('mongodb+srv://')) {
        throw new Error(`Invalid MongoDB URI format. Must start with 'mongodb://' or 'mongodb+srv://'. Got: ${mongoURI.substring(0, 30)}...`);
      }
    }
    
    console.log('🔄 Connecting to MongoDB...');
    
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000, 
      socketTimeoutMS: 45000, 
    });

    console.log('connected mongodb')
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB:`);
    console.error(`   Message: ${error.message}`);
    if (error.name === 'MongoServerSelectionError') {
      console.error('   This usually means the server cannot be reached. Check:');
      console.error('   - Network connectivity');
      console.error('   - MongoDB Atlas IP whitelist settings');
      console.error('   - Connection string credentials');
    }
    process.exit(1);
  }
};

export default connectDB;

