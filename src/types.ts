export type BikeCategory = 'all' | 'supersport' | 'naked' | 'adventure' | 'cruiser' | 'heritage';

export interface BikeColorOption {
  name: string;
  hex: string;
  metallic?: boolean;
}

export interface BikeSpec {
  powerHp: number;
  torqueNm: number;
  displacementCc: number;
  weightKg: number;
  topSpeedKmH: number;
  accel0100: number; // in seconds
  fuelCapacityL: number;
  seatHeightMm: number;
  engineType: string;
  transmission: string;
  frontBrakes: string;
  suspension: string;
}

export interface Hotspot3D {
  id: string;
  title: string;
  description: string;
  position: [number, number, number]; // [x, y, z] in 3D scene
}

export interface Motorcycle {
  id: string;
  name: string;
  subtitle: string;
  category: BikeCategory;
  categoryLabel: string;
  price: number;
  monthlyEstimate: number;
  tagline: string;
  description: string;
  badge?: string;
  colors: BikeColorOption[];
  specs: BikeSpec;
  features: string[];
  hotspots: Hotspot3D[];
  threeDConfig: {
    frameColor: string;
    styleType: 'supersport' | 'naked' | 'adventure' | 'cruiser' | 'heritage';
    hasFairing: boolean;
    hasPanniers?: boolean;
    hasTallScreen?: boolean;
  };
}

export interface TestRideBooking {
  fullName: string;
  email: string;
  phone: string;
  bikeId: string;
  bikeName: string;
  licenseType: string;
  preferredDate: string;
  preferredTime: string;
  dealershipLocation: string;
  notes?: string;
}
