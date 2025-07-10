# SafeSpace - Women's Safety Platform

A comprehensive safety platform designed to empower women with real-time safety tools, community support, and emergency assistance.

## Features

- **Real-time Location Sharing** - Share your location with trusted contacts
- **Emergency SOS** - One-tap emergency button for instant alerts
- **Community Network** - Connect with other women for mutual support
- **Safety Heat Map** - View real-time safety reports and avoid dangerous areas
- **Anonymous Reporting** - Report incidents to help others stay safe
- **Safe Route Planning** - Get the safest route recommendations
- **Secure Messaging** - End-to-end encrypted communication
- **24/7 Support** - Access to trained counselors and support staff

## Tech Stack

### Frontend
- **React** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for development and building

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd safespace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/safespace
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=5000
   ```

4. **Start MongoDB**
   - If using local MongoDB: `mongod`
   - If using MongoDB Atlas: Update the `MONGODB_URI` in `.env`

### Running the Application

#### Option 1: Run Frontend and Backend Separately

**Terminal 1 - Backend:**
```bash
npm run server
```
The backend API will be available at `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
npm run dev
```
The frontend will be available at `http://localhost:5173`

#### Option 2: Run Both Together (Recommended)

```bash
npm run dev:full
```
This will start both the backend server and frontend development server concurrently.

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/contacts` - Get user's emergency contacts
- `POST /api/auth/contacts` - Add emergency contact

#### Safety
- `POST /api/safety/reports` - Create a safety report
- `GET /api/safety/reports` - Get safety reports in area
- `POST /api/safety/emergency` - Create emergency alert
- `GET /api/safety/emergency` - Get emergency alerts

#### Health Check
- `GET /api/health` - Check API status

### Database Schema

#### User Model
```javascript
{
  fullName: String,
  email: String (unique),
  phone: String (unique),
  password: String (hashed),
  emergencyContacts: Array,
  locationSharingEnabled: Boolean,
  city: String,
  state: String,
  isVerified: Boolean
}
```

#### Safety Report Model
```javascript
{
  userId: ObjectId,
  location: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  address: String,
  reportType: String,
  description: String,
  severity: String,
  isAnonymous: Boolean,
  verified: Boolean
}
```

#### Emergency Alert Model
```javascript
{
  userId: ObjectId,
  location: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  address: String,
  status: String,
  contactsNotified: Array,
  policeNotified: Boolean
}
```

## Backend Integration Status

✅ **Fully Integrated Features:**
- User authentication with JWT
- Emergency alert system with location sharing
- Safety report creation and retrieval
- Emergency contacts management
- Real-time location services
- API service layer with error handling

✅ **Frontend-Backend Connection:**
- Authentication context with persistent login
- Emergency button with actual API calls
- Safety map with real data loading
- User state management throughout the app

## Development

### Project Structure
```
safespace/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── services/          # API services
│   ├── contexts/          # React contexts (Auth)
│   └── lib/               # Utilities and configurations
├── server/                # Backend source code
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   └── config/            # Database configuration
└── public/                # Static assets
```

### Available Scripts

- `npm run dev` - Start frontend development server
- `npm run server` - Start backend server
- `npm run dev:full` - Start both frontend and backend
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/safespace

# JWT Secret (generate a strong secret for production)
JWT_SECRET=your-super-secret-jwt-key-here

# Server Port
PORT=5000

# Optional: MongoDB Atlas (if using cloud database)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/safespace
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@safespace.com or join our community forum.

---

**Made with 💝 for women's safety worldwide**