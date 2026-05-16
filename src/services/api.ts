const normalizeApiBaseUrl = (url?: string) => {
  const fallback = 'http://localhost:5000/api';
  const raw = (url || fallback).trim().replace(/\/+$/, '');
  return raw.endsWith('/api') ? raw : `${raw}/api`;
};

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

class ApiService {
  private static getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private static async parseResponse(response: Response) {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || `Request failed with status ${response.status}`);
      }
      return data;
    }

    const text = await response.text();
    if (!response.ok) {
      throw new Error(text || `Request failed with status ${response.status}`);
    }

    throw new Error('Unexpected non-JSON response from server');
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
    return this.parseResponse(response);
  }

  static async login(credentials: { email: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(credentials)
    });
    return this.parseResponse(response);
  }

  static async requestPasswordReset(payload: { email: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return this.parseResponse(response);
  }

  static async resetPassword(payload: { email: string; token: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return this.parseResponse(response);
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
    return this.parseResponse(response);
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
    return this.parseResponse(response);
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
    return this.parseResponse(response);
  }
}

export default ApiService;