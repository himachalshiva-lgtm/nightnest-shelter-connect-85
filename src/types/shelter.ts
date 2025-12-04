export type ShelterStatus = 'available' | 'limited' | 'full';

export interface Shelter {
  id: string;
  name: string;
  address: string;
  totalBeds: number;
  availableBeds: number;
  status: ShelterStatus;
  volunteers: number;
  mealsAvailable: boolean;
  checkInTime: string;
  checkOutTime: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  amenities: string[];
  phone: string;
}

export interface WristbandProfile {
  id: string;
  wristbandId: string;
  lastCheckIn: string;
  lastShelter: string;
  healthNotes: string[];
  checkInCount: number;
  recommendedShelter: Shelter | null;
}

export interface DashboardStats {
  totalCheckIns: number;
  activeShelters: number;
  availableBeds: number;
  registeredWristbands: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'staff' | 'admin';
  shelterId?: string;
}
