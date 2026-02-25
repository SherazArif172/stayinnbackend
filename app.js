import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

const app = express();

// Middleware
// Allow launch site (Next.js), dashboard (Vite), and LAN access for dashboard (e.g. 192.168.x.x:8080)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8080',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:8080',
];
// In development, allow any origin matching *:8080 or common LAN IPs (optional)
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // same-origin or non-browser
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow dashboard when accessed via LAN IP (e.g. http://192.168.2.1:8080)
    if (/^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(origin)) return callback(null, true);
    callback(null, false);
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'StayInn Hostels API Server',
    status: 'running',
    version: '1.0.0'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
import roomRoutes from './src/routes/roomRoutes.js';
import contactRoutes from './src/routes/contactRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import facilityRoutes from './src/routes/facilityRoutes.js';
import bookingRoutes from './src/routes/bookingRoutes.js';
import residentRoutes from './src/routes/residentRoutes.js';

app.use('/api/rooms', roomRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/residents', residentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export default app;
