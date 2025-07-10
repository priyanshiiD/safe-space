// Emergency numbers database by country/region
export interface EmergencyNumber {
  service: string;
  number: string;
  description: string;
  type: 'police' | 'medical' | 'fire' | 'women' | 'crisis' | 'general';
}

export interface LocationEmergencyData {
  country: string;
  countryCode: string;
  region?: string;
  numbers: EmergencyNumber[];
}

export const emergencyDatabase: LocationEmergencyData[] = [
  // India
  {
    country: "India",
    countryCode: "IN",
    numbers: [
      { service: "Police", number: "100", description: "Police Emergency", type: "police" },
      { service: "Women Helpline", number: "1091", description: "Women in Distress", type: "women" },
      { service: "Women Safety", number: "181", description: "Women in Distress", type: "women" },
      { service: "Ambulance", number: "108", description: "Medical Emergency", type: "medical" },
      { service: "Fire", number: "101", description: "Fire Emergency", type: "fire" },
      { service: "Child Helpline", number: "1098", description: "Child in Need", type: "crisis" },
      { service: "Senior Citizen", number: "14567", description: "Senior Citizen Helpline", type: "crisis" },
      { service: "Disaster Management", number: "108", description: "Natural Disasters", type: "general" }
    ]
  },
  // United States
  {
    country: "United States",
    countryCode: "US",
    numbers: [
      { service: "Emergency", number: "911", description: "Police, Fire, Medical", type: "general" },
      { service: "Crisis Hotline", number: "988", description: "Suicide & Crisis Lifeline", type: "crisis" },
      { service: "Domestic Violence", number: "1-800-799-7233", description: "National Domestic Violence Hotline", type: "women" },
      { service: "RAINN", number: "1-800-656-4673", description: "Sexual Assault Hotline", type: "women" },
      { service: "Crisis Text", number: "741741", description: "Text HOME for crisis support", type: "crisis" },
      { service: "Poison Control", number: "1-800-222-1222", description: "Poison Emergency", type: "medical" }
    ]
  },
  // United Kingdom
  {
    country: "United Kingdom",
    countryCode: "GB",
    numbers: [
      { service: "Emergency", number: "999", description: "Police, Fire, Ambulance", type: "general" },
      { service: "Non-Emergency Police", number: "101", description: "Non-urgent police matters", type: "police" },
      { service: "NHS", number: "111", description: "Non-emergency medical", type: "medical" },
      { service: "Women's Aid", number: "0808 2000 247", description: "Domestic violence support", type: "women" },
      { service: "Samaritans", number: "116 123", description: "Emotional support", type: "crisis" },
      { service: "Rape Crisis", number: "0808 802 9999", description: "Sexual violence support", type: "women" }
    ]
  },
  // Canada
  {
    country: "Canada",
    countryCode: "CA",
    numbers: [
      { service: "Emergency", number: "911", description: "Police, Fire, Medical", type: "general" },
      { service: "Crisis Services", number: "1-833-456-4566", description: "Talk Suicide Canada", type: "crisis" },
      { service: "Kids Help Phone", number: "1-800-668-6868", description: "Youth support", type: "crisis" },
      { service: "Assaulted Women", number: "1-866-863-0511", description: "24/7 crisis line", type: "women" },
      { service: "Elder Abuse", number: "1-866-299-1011", description: "Senior safety", type: "crisis" }
    ]
  },
  // Australia
  {
    country: "Australia",
    countryCode: "AU",
    numbers: [
      { service: "Emergency", number: "000", description: "Police, Fire, Ambulance", type: "general" },
      { service: "Lifeline", number: "13 11 14", description: "Crisis support", type: "crisis" },
      { service: "1800RESPECT", number: "1800 737 732", description: "Sexual assault & domestic violence", type: "women" },
      { service: "Kids Helpline", number: "1800 551 800", description: "Youth support", type: "crisis" },
      { service: "Beyond Blue", number: "1300 224 636", description: "Mental health support", type: "crisis" }
    ]
  },
  // Germany
  {
    country: "Germany",
    countryCode: "DE",
    numbers: [
      { service: "Emergency", number: "112", description: "Fire & Medical Emergency", type: "general" },
      { service: "Police", number: "110", description: "Police Emergency", type: "police" },
      { service: "Violence Against Women", number: "08000 116 016", description: "Women's helpline", type: "women" },
      { service: "Telefonseelsorge", number: "0800 111 0 111", description: "Crisis counseling", type: "crisis" },
      { service: "Number Against Grief", number: "0800 111 0 222", description: "Grief counseling", type: "crisis" }
    ]
  },
  // Default/International
  {
    country: "International",
    countryCode: "INTL",
    numbers: [
      { service: "Emergency", number: "112", description: "International emergency number", type: "general" },
      { service: "Local Police", number: "Contact local authorities", description: "Contact your local police", type: "police" },
      { service: "Medical Emergency", number: "Contact local emergency services", description: "Contact local medical services", type: "medical" },
      { service: "Women's Crisis", number: "Contact local women's shelter", description: "Find local women's support", type: "women" }
    ]
  }
];

export class LocationEmergencyService {
  private static userLocation: { country?: string; countryCode?: string } = {};

  // Get user's location using browser geolocation and reverse geocoding
  static async getUserLocation(): Promise<{ country: string; countryCode: string } | null> {
    try {
      // First try to get cached location
      if (this.userLocation.country && this.userLocation.countryCode) {
        return this.userLocation;
      }

      // Get user's position
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: false
        });
      });

      const { latitude, longitude } = position.coords;

      // Use a free geocoding service to get country
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      
      if (response.ok) {
        const data = await response.json();
        this.userLocation = {
          country: data.countryName,
          countryCode: data.countryCode
        };
        return this.userLocation;
      }
    } catch (error) {
      console.warn('Could not get user location:', error);
    }

    return null;
  }

  // Get emergency numbers for user's location
  static async getEmergencyNumbers(): Promise<EmergencyNumber[]> {
    const location = await this.getUserLocation();
    
    if (location) {
      const locationData = emergencyDatabase.find(
        data => data.countryCode === location.countryCode
      );
      
      if (locationData) {
        return locationData.numbers;
      }
    }

    // Fallback to international numbers
    const internationalData = emergencyDatabase.find(data => data.countryCode === "INTL");
    return internationalData?.numbers || [];
  }

  // Get emergency numbers by country code
  static getEmergencyNumbersByCountry(countryCode: string): EmergencyNumber[] {
    const locationData = emergencyDatabase.find(data => data.countryCode === countryCode);
    return locationData?.numbers || [];
  }

  // Get specific type of emergency numbers
  static async getEmergencyNumbersByType(type: EmergencyNumber['type']): Promise<EmergencyNumber[]> {
    const allNumbers = await this.getEmergencyNumbers();
    return allNumbers.filter(number => number.type === type);
  }

  // Format phone number for calling
  static formatForCalling(number: string): string {
    // Remove any non-digit characters except + and -
    return number.replace(/[^\d+\-]/g, '');
  }

  // Check if number is callable (not a text-based instruction)
  static isCallable(number: string): boolean {
    return /^\+?[\d\-\s()]+$/.test(number) && !number.toLowerCase().includes('contact');
  }
}