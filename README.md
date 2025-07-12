# 🛡️ SafeSpace - Women's Safety Platform

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green.svg)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-purple.svg)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black.svg)](https://vercel.com/)
[![Railway](https://img.shields.io/badge/Backend%20on-Railway-blue.svg)](https://railway.app/)

> **A comprehensive women's safety platform providing real-time emergency assistance, location-based safety reports, and community support.**

## 🌟 Live Demo

- **Frontend**: [https://safe-space-delta.vercel.app/](https://safe-space-delta.vercel.app/)
- **Backend API**: [https://safe-space-production-dd53.up.railway.app/](https://safe-space-production-dd53.up.railway.app/)

## 🎯 Project Overview

SafeSpace is a full-stack women's safety application designed to provide immediate assistance and community support. The platform features real-time emergency alerts, location-based safety reporting, and emergency contact management.

### ✨ Key Features

- 🚨 **Emergency Alert System** - Instant emergency notifications with GPS location
- 📍 **Location-Based Safety Reports** - Community-driven safety mapping
- 👥 **Emergency Contact Management** - Trusted contacts integration
- 🗺️ **Interactive Safety Map** - Visual safety data with real-time updates
- 📱 **Mobile-First Design** - Optimized for mobile emergency situations
- 🔐 **Secure Authentication** - JWT-based user authentication
- 🌐 **Real-Time Updates** - Live safety information and alerts

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for responsive, modern UI design
- **Lucide React** for beautiful, consistent icons
- **React Router** for seamless navigation

### Backend Stack
- **Node.js** with Express.js for RESTful API
- **MongoDB** with Mongoose for data persistence
- **JWT** for secure authentication
- **CORS** configured for cross-origin requests
- **Railway** for cloud deployment

### DevOps & Deployment
- **Vercel** for frontend hosting and CI/CD
- **Railway** for backend hosting and database
- **GitHub** for version control and collaboration
- **Environment Variables** for secure configuration

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB Atlas account (for production)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/priyanshiiD/safe-space.git
   cd safe-space
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

4. **Set up environment variables**
   
   Create `.env` file in the `server` directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   NODE_ENV=development
   ```

5. **Start the development servers**

   **Backend (Terminal 1):**
   ```bash
   cd server
   npm start
   ```

   **Frontend (Terminal 2):**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
safe-space/
├── src/                    # Frontend source code
│   ├── components/        # React components
│   │   ├── EmergencyButton.tsx
│   │   ├── SafetyMap.tsx
│   │   ├── Header.tsx
│   │   └── ...
│   ├── services/          # API services
│   │   ├── api.ts
│   │   └── safetyService.ts
│   ├── utils/             # Utility functions
│   └── App.tsx           # Main application
├── server/                # Backend source code
│   ├── config/           # Database configuration
│   ├── middleware/       # Express middleware
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   └── server.js         # Express server
├── public/               # Static assets
└── package.json          # Frontend dependencies
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication

### Safety Features
- `POST /api/safety/reports` - Create safety report
- `GET /api/safety/reports` - Get safety reports by location
- `POST /api/safety/emergency` - Send emergency alert

### Health Check
- `GET /api/health` - API health status
- `GET /health` - Railway health check

## 🎨 UI/UX Features

### Design Principles
- **Accessibility First** - WCAG 2.1 compliant design
- **Mobile-First** - Optimized for emergency mobile use
- **Intuitive Navigation** - Clear, simple user interface
- **Fast Loading** - Optimized for critical situations
- **Responsive Design** - Works on all device sizes

### Color Scheme
- **Primary**: Pink/Rose gradient for safety and warmth
- **Emergency**: Red gradient for urgent situations
- **Success**: Green for positive feedback
- **Neutral**: Gray scale for content and text

## 🔒 Security Features

- **JWT Authentication** - Secure user sessions
- **Password Hashing** - bcrypt encryption
- **CORS Protection** - Configured for production domains
- **Input Validation** - Server-side data validation
- **Environment Variables** - Secure configuration management

## 📊 Performance Optimizations

- **Code Splitting** - Lazy-loaded components
- **Image Optimization** - Compressed assets
- **Bundle Optimization** - Tree shaking and minification
- **CDN Integration** - Fast global content delivery
- **Database Indexing** - Optimized queries

## 🚀 Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set environment variables:
   - `VITE_API_URL`: Backend API URL
3. Automatic deployment on push to main branch

### Backend (Railway)
1. Connect GitHub repository to Railway
2. Set environment variables:
   - `MONGODB_URI`: MongoDB connection string
   - `JWT_SECRET`: JWT secret key
   - `PORT`: Server port
3. Automatic deployment on push to main branch

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Emergency button functionality
- [ ] Safety report creation
- [ ] Location-based safety data
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

### API Testing
```bash
# Test health endpoint
curl https://safe-space-production-dd53.up.railway.app/health

# Test API health
curl https://safe-space-production-dd53.up.railway.app/api/health
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Vercel** for seamless frontend deployment
- **Railway** for reliable backend hosting
- **MongoDB Atlas** for cloud database services

## 📞 Support

For support or questions, please create an issue in this repository or contact the project maintainer.

---

**Built with ❤️ for women's safety and community support**

*Last updated: July 2024*