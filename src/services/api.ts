const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Debug: Log the API URL being used
console.log('API_BASE_URL:', API_BASE_URL);
console.log('VITE_API_URL env var:', import.meta.env.VITE_API_URL);

class ApiService {
  private static getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // Auth methods
  static async register(userData: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    city: string;
    state: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return response.json();
  }

  static async login(credentials: { email: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(credentials)
    });
    return response.json();
  }

  // Safety methods
  static async createSafetyReport(reportData: {
    coordinates: [number, number];
    address: string;
    reportType: string;
    description: string;
    severity: string;
    isAnonymous: boolean;
  }) {
    const response = await fetch(`${API_BASE_URL}/safety/reports`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(reportData)
    });
    return response.json();
  }

  static async getSafetyReports(lat: number, lng: number, radius?: number) {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      ...(radius && { radius: radius.toString() })
    });
    
    const response = await fetch(`${API_BASE_URL}/safety/reports?${params}`, {
      headers: this.getAuthHeaders()
    });
    return response.json();
  }

  static async createEmergencyAlert(alertData: {
    coordinates: [number, number];
    address: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/safety/emergency`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(alertData)
    });
    return response.json();
  }
}

export default ApiService;