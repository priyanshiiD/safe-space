import mongoose from 'mongoose';

const safetyReportSchema = new mongoose.Schema({
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
  reportType: {
    type: String,
    enum: ['harassment', 'unsafe_area', 'well_lit', 'safe_zone', 'emergency'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create geospatial index
safetyReportSchema.index({ location: '2dsphere' });

export default mongoose.model('SafetyReport', safetyReportSchema);