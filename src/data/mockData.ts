import { Shelter, WristbandProfile, DashboardStats } from '@/types/shelter';
import { getRecommendedShelter } from '@/lib/geoUtils';

export const mockShelters: Shelter[] = [
  {
    id: '1',
    name: 'Hope Haven Center',
    address: '123 Main Street, Downtown',
    totalBeds: 50,
    availableBeds: 18,
    status: 'available',
    volunteers: 8,
    mealsAvailable: true,
    checkInTime: '3:00 PM',
    checkOutTime: '6:00 AM',
    coordinates: { lat: 40.7128, lng: -74.006 },
    amenities: ['Showers', 'Meals', 'Lockers', 'WiFi'],
    phone: '(555) 123-4567',
  },
  {
    id: '2',
    name: 'Sunrise Shelter',
    address: '456 Oak Avenue, Midtown',
    totalBeds: 35,
    availableBeds: 5,
    status: 'limited',
    volunteers: 4,
    mealsAvailable: true,
    checkInTime: '4:00 PM',
    checkOutTime: '7:00 AM',
    coordinates: { lat: 40.7589, lng: -73.9851 },
    amenities: ['Showers', 'Meals', 'Medical Support'],
    phone: '(555) 234-5678',
  },
  {
    id: '3',
    name: 'Safe Harbor House',
    address: '789 Elm Street, Uptown',
    totalBeds: 40,
    availableBeds: 0,
    status: 'full',
    volunteers: 6,
    mealsAvailable: false,
    checkInTime: '5:00 PM',
    checkOutTime: '8:00 AM',
    coordinates: { lat: 40.7831, lng: -73.9712 },
    amenities: ['Showers', 'Lockers', 'Counseling'],
    phone: '(555) 345-6789',
  },
  {
    id: '4',
    name: 'New Beginnings Refuge',
    address: '321 Pine Road, Eastside',
    totalBeds: 60,
    availableBeds: 32,
    status: 'available',
    volunteers: 10,
    mealsAvailable: true,
    checkInTime: '3:30 PM',
    checkOutTime: '6:30 AM',
    coordinates: { lat: 40.7282, lng: -73.7949 },
    amenities: ['Showers', 'Meals', 'Lockers', 'Job Assistance'],
    phone: '(555) 456-7890',
  },
  {
    id: '5',
    name: 'Community Care Center',
    address: '654 Maple Drive, Westend',
    totalBeds: 45,
    availableBeds: 8,
    status: 'limited',
    volunteers: 5,
    mealsAvailable: true,
    checkInTime: '4:30 PM',
    checkOutTime: '7:30 AM',
    coordinates: { lat: 40.6892, lng: -74.0445 },
    amenities: ['Showers', 'Meals', 'WiFi', 'Laundry'],
    phone: '(555) 567-8901',
  },
];

export const mockDashboardStats: DashboardStats = {
  totalCheckIns: 1247,
  activeShelters: 5,
  availableBeds: 63,
  registeredWristbands: 892,
};

export const mockWristbandProfile: WristbandProfile = {
  id: '1',
  wristbandId: 'NN-USER-0847',
  lastCheckIn: '2024-01-14',
  lastShelter: 'Hope Haven Center',
  healthNotes: [
    'Sensitive to cold - prefers lower bunk',
    'Mild seasonal allergies',
  ],
  checkInCount: 23,
  recommendedShelter: mockShelters[0],
};

// Default location for NYC (Times Square area)
const DEFAULT_USER_LOCATION = { lat: 40.7580, lng: -73.9855 };

export const generateWristbandProfile = (
  wristbandId: string,
  userLocation?: { lat: number; lng: number }
): WristbandProfile => {
  const location = userLocation || DEFAULT_USER_LOCATION;
  
  // Get nearest available shelter based on location
  const recommendedShelter = getRecommendedShelter(location, mockShelters) || mockShelters[0];
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    wristbandId,
    lastCheckIn: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lastShelter: mockShelters[Math.floor(Math.random() * mockShelters.length)].name,
    healthNotes: [
      'Prefers quiet areas',
      'No known allergies',
    ],
    checkInCount: Math.floor(Math.random() * 50) + 1,
    recommendedShelter,
  };
};
