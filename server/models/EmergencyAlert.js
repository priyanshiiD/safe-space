import mongoose from 'mongoose';

const emergencyAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  address: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'false_alarm'],
    default: 'active'
  },
  locationHistory: [{
    coordinates: {
      type: [Number],
      required: true
    },
    recordedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastLocationAt: {
    type: Date
  },
  contactsNotified: [{
    name: String,
    email: String,
    phone: String,
    notifiedAt: Date
  }],
  policeNotified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create geospatial index
emergencyAlertSchema.index({ location: '2dsphere' });

export default mongoose.model('EmergencyAlert', emergencyAlertSchema);