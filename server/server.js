import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import safetyRoutes from './routes/safety.js';

// Load environment variables silently
dotenv.config({ silent: true });

const app = express();

// Connect to MongoDB
connectDB();

// CORS setup for Vercel and localhost
const allowedOrigins = [
  'https://safe-space-sooty.vercel.app',
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});