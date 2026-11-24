import express from 'express';
import SafetyReport from '../models/SafetyReport.js';
import EmergencyAlert from '../models/EmergencyAlert.js';
import User from '../models/User.js';
import { sendEmergencyAlertEmail } from '../utils/sendgrid.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Create safety report
router.post('/reports', auth, async (req, res) => {
  try {
    const { coordinates, address, reportType, description, severity, isAnonymous } = req.body;
    const validReportTypes = ['harassment', 'unsafe_area', 'well_lit', 'safe_zone', 'emergency'];
    const validSeverities = ['low', 'medium', 'high'];

    if (
      !Array.isArray(coordinates) ||
      coordinates.length !== 2 ||
      !coordinates.every(Number.isFinite) ||
      coordinates[0] < -180 || coordinates[0] > 180 ||
      coordinates[1] < -90 || coordinates[1] > 90 ||
      typeof address !== 'string' || !address.trim() ||
      typeof description !== 'string' || description.trim().length < 5 || description.trim().length > 500 ||
      !validReportTypes.includes(reportType) ||
      !validSeverities.includes(severity) ||
      (isAnonymous !== undefined && typeof isAnonymous !== 'boolean')
    ) {
      return res.status(400).json({ message: 'Please provide a valid incident report and location.' });
    }

    const report = new SafetyReport({
      userId: req.userId,
      location: {
        type: 'Point',
        coordinates: coordinates // [longitude, latitude]
      },
      address: address.trim(),
      reportType,
      description: description.trim(),
      severity,
      isAnonymous: isAnonymous === true
    });

    await report.save();

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
    const latitude = Number(lat);
    const longitude = Number(lng);
    const radiusMeters = Number(radius);

    if (
      !Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
      !Number.isFinite(longitude) || longitude < -180 || longitude > 180 ||
      !Number.isFinite(radiusMeters) || radiusMeters <= 0
    ) {
      return res.status(400).json({ message: 'Valid latitude, longitude, and radius are required.' });
    }

    const reports = await SafetyReport.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radiusMeters
        }
      }
    }).populate('userId', 'fullName').sort({ createdAt: -1 });

    res.json({
      reports: reports.map(report => {
        const result = report.toObject();
        if (result.isAnonymous) delete result.userId;
        return result;
      })
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create emergency alert
router.post('/emergency', auth, async (req, res) => {
  try {
    console.log('SOS create request received', {
      userId: req.userId,
      hasBody: Boolean(req.body)
    });
    const { coordinates, address } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const alert = new EmergencyAlert({
      userId: req.userId,
      location: {
        type: 'Point',
        coordinates: coordinates
      },
      address,
      locationHistory: [{
        coordinates
      }],
      lastLocationAt: new Date()
    });

    await alert.save();

    const contactEmails = (user.emergencyContacts || [])
      .filter((contact) => contact.email)
      .map((contact) => ({
        name: contact.name,
        email: contact.email,
        phone: contact.phone
      }));

    if (contactEmails.length > 0) {
      const mapsLink = `https://www.google.com/maps?q=${coordinates[1]},${coordinates[0]}`;
      const subject = 'SOS Alert: Immediate assistance needed';
      const text = `${user.fullName} has triggered an SOS alert.\n\nLocation: ${mapsLink}\n\nAddress: ${address}`;
      const html = `
        <p><strong>${user.fullName}</strong> has triggered an SOS alert.</p>
        <p>Address: ${address}</p>
        <p><a href="${mapsLink}">View live location</a></p>
      `;

      try {
        for (const contact of contactEmails) {
          await sendEmergencyAlertEmail({
            to: contact.email,
            subject,
            text,
            html
          });
        }

        alert.contactsNotified = contactEmails.map((contact) => ({
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          notifiedAt: new Date()
        }));
        await alert.save();
      } catch (emailError) {
        console.error('Failed to send emergency emails via SendGrid:', emailError.response?.body || emailError.message);
        // We catch the error but DO NOT throw it, so the SOS alert is still created successfully
        // on the platform even if the email notifications fail to send.
      }
    }

    // Here you would integrate with SMS/notification services
    // to alert emergency contacts and authorities

    res.status(201).json({
      message: 'Emergency alert created successfully',
      alert
    });
  } catch (error) {
    console.error('SOS create error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update emergency location
router.put('/emergency/:id/location', auth, async (req, res) => {
  try {
    const { coordinates, address } = req.body;
    const { id } = req.params;

    const alert = await EmergencyAlert.findOne({ _id: id, userId: req.userId, status: 'active' });

    if (!alert) {
      return res.status(404).json({ message: 'Active alert not found' });
    }

    alert.location = {
      type: 'Point',
      coordinates
    };
    if (address) {
      alert.address = address;
    }
    alert.locationHistory.push({ coordinates });
    alert.lastLocationAt = new Date();

    await alert.save();

    res.json({ message: 'Location updated', alert });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get emergency alerts (for admin/authorities)
router.get('/emergency', auth, async (req, res) => {
  try {
    const alerts = await EmergencyAlert.find({ status: 'active' })
      .populate('userId', 'fullName phone')
      .sort({ createdAt: -1 });

    res.json({ alerts });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Public SOS monitor feed
router.get('/emergency/public', async (req, res) => {
  try {
    const alerts = await EmergencyAlert.find({ status: 'active' })
      .select('address status lastLocationAt createdAt location')
      .sort({ createdAt: -1 });

    res.json({ alerts });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Stop/resolution of an active SOS
router.patch('/emergency/:id/resolve', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await EmergencyAlert.findOne({ _id: id, userId: req.userId, status: 'active' });

    if (!alert) {
      return res.status(404).json({ message: 'Active alert not found' });
    }

    alert.status = 'resolved';
    await alert.save();

    res.json({ message: 'SOS resolved', alert });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;