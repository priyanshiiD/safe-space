import express from 'express';
import SafetyReport from '../models/SafetyReport.js';
import EmergencyAlert from '../models/EmergencyAlert.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Create safety report
router.post('/reports', auth, async (req, res) => {
  try {
    const { coordinates, address, reportType, description, severity, isAnonymous } = req.body;

    const report = new SafetyReport({
      userId: req.userId,
      location: {
        type: 'Point',
        coordinates: coordinates // [longitude, latitude]
      },
      address,
      reportType,
      description,
      severity,
      isAnonymous
    });

    await report.save();
    await report.populate('userId', 'fullName');

    res.status(201).json({
      message: 'Safety report created successfully',
      report
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get safety reports in area
router.get('/reports', async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query; // radius in meters

    const reports = await SafetyReport.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      }
    }).populate('userId', 'fullName').sort({ createdAt: -1 });

    res.json({ reports });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create emergency alert
router.post('/emergency', auth, async (req, res) => {
  try {
    const { coordinates, address } = req.body;

    const alert = new EmergencyAlert({
      userId: req.userId,
      location: {
        type: 'Point',
        coordinates: coordinates
      },
      address
    });

    await alert.save();

    // Log emergency alert for monitoring
    console.log('🚨 EMERGENCY ALERT RECEIVED:', {
      timestamp: new Date().toISOString(),
      userId: req.userId,
      location: {
        latitude: coordinates[1],
        longitude: coordinates[0]
      },
      address: address,
      alertId: alert._id
    });

    // Here you would integrate with SMS/notification services
    // to alert emergency contacts and authorities
    // For now, we'll just log it for monitoring

    res.status(201).json({
      message: 'Emergency alert created successfully',
      alert
    });
  } catch (error) {
    console.error('Error creating emergency alert:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get emergency alerts (for admin/authorities)
router.get('/emergency', auth, async (req, res) => {
  try {
    const alerts = await EmergencyAlert.find({ status: 'active' })
      .populate('userId', 'fullName phone')
      .sort({ createdAt: -1 });

    // Log for monitoring
    console.log(`📊 EMERGENCY ALERTS QUERIED: ${alerts.length} active alerts`);

    res.json({ alerts });
  } catch (error) {
    console.error('Error fetching emergency alerts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get emergency alert statistics (for monitoring)
router.get('/emergency/stats', auth, async (req, res) => {
  try {
    const totalAlerts = await EmergencyAlert.countDocuments();
    const activeAlerts = await EmergencyAlert.countDocuments({ status: 'active' });
    const todayAlerts = await EmergencyAlert.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });

    res.json({
      totalAlerts,
      activeAlerts,
      todayAlerts,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching emergency stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;