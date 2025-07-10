import ApiService from './api';

export interface SafetyReport {
  id: string;
  userId: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  address: string;
  reportType: 'harassment' | 'unsafe_area' | 'well_lit' | 'safe_zone' | 'emergency';
  description: string;
  severity: 'low' | 'medium' | 'high';
  isAnonymous: boolean;
  createdAt: string;
  verified: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

export class SafetyService {
  // Report safety incidents
  static async createSafetyReport(report: {
    coordinates: [number, number];
    address: string;
    reportType: string;
    description: string;
    severity: string;
    isAnonymous: boolean;
  }) {
    return await ApiService.createSafetyReport(report);
  }

  // Get safety reports for a specific area
  static async getSafetyReports(latitude: number, longitude: number, radius: number = 5) {
    return await ApiService.getSafetyReports(latitude, longitude, radius);
  }

  // Emergency contact management
  static async addEmergencyContact(contact: {
    name: string;
    phone: string;
    relationship: string;
    isPrimary: boolean;
  }) {
    // This would be a new API endpoint to add emergency contacts
    const response = await fetch('http://localhost:5000/api/auth/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(contact)
    });
    return response.json();
  }

  static async getEmergencyContacts() {
    // This would be a new API endpoint to get emergency contacts
    const response = await fetch('http://localhost:5000/api/auth/contacts', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  }

  // Send emergency alert
  static async sendEmergencyAlert(location: { latitude: number; longitude: number }, address: string) {
    return await ApiService.createEmergencyAlert({
      coordinates: [location.longitude, location.latitude],
      address
    });
  }
}