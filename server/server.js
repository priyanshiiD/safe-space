import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import safetyRoutes from './routes/safety.js';

// Load environment variables
dotenv.config();

const app = express();

// CORS setup for Vercel and localhost
const allowedOrigins = [
  'https://safe-space-sooty.vercel.app',
  'https://safe-space-frontend.vercel.app',
  'https://safe-space.vercel.app',
  'https://safespace.vercel.app',
  'https://safe-space-delta.vercel.app',
  'http://localhost:5173'
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/safety', safetyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'SafeSpace API is running', status: 'healthy' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'SafeSpace Backend API', status: 'running' });
});

// Railway health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;

// Start server with better error handling
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();