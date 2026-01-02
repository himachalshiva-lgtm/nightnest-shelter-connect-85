import { Shelter, WristbandProfile, DashboardStats } from '@/types/shelter';
import { getRecommendedShelter } from '@/lib/geoUtils';

// Delhi-based government school night shelters
export const mockShelters: Shelter[] = [
  {
    id: '1',
    name: 'Govt. Boys Sr. Sec. School - Sarai Kale Khan',
    address: 'Sarai Kale Khan, Near ISBT, Delhi',
    totalBeds: 150,
    availableBeds: 42,
    status: 'available',
    volunteers: 12,
    mealsAvailable: true,
    checkInTime: '6:00 PM',
    checkOutTime: '6:00 AM',
    coordinates: { lat: 28.5921, lng: 77.254 },
    amenities: ['Blankets', 'Meals', 'Toilets', 'Medical Aid'],
    phone: '+91-11-23456001',
  },
  {
    id: '2',
    name: 'Govt. Co-ed School - Yamuna Pushta',
    address: 'Yamuna Pushta, Near ITO, Delhi',
    totalBeds: 120,
    availableBeds: 18,
    status: 'limited',
    volunteers: 8,
    mealsAvailable: true,
    checkInTime: '6:00 PM',
    checkOutTime: '6:00 AM',
    coordinates: { lat: 28.6328, lng: 77.2478 },
    amenities: ['Blankets', 'Meals', 'Toilets', 'Hygiene Kits'],
    phone: '+91-11-23456002',
  },
  {
    id: '3',
    name: 'Govt. Girls School - AIIMS Area',
    address: 'Near AIIMS Metro Station, Delhi',
    totalBeds: 100,
    availableBeds: 0,
    status: 'full',
    volunteers: 6,
    mealsAvailable: false,
    checkInTime: '6:00 PM',
    checkOutTime: '6:00 AM',
    coordinates: { lat: 28.5689, lng: 77.21 },
    amenities: ['Blankets', 'Toilets', 'Counseling'],
    phone: '+91-11-23456003',
  },
  {
    id: '4',
    name: 'Govt. Sr. Sec. School - Nizamuddin',
    address: 'Hazrat Nizamuddin, Near Station, Delhi',
    totalBeds: 80,
    availableBeds: 35,
    status: 'available',
    volunteers: 10,
    mealsAvailable: true,
    checkInTime: '6:00 PM',
    checkOutTime: '6:00 AM',
    coordinates: { lat: 28.59, lng: 77.2514 },
    amenities: ['Blankets', 'Meals', 'Toilets', 'Clothing'],
    phone: '+91-11-23456004',
  },
  {
    id: '5',
    name: 'Govt. Boys School - Kashmere Gate',
    address: 'Kashmere Gate, Near ISBT, Delhi',
    totalBeds: 200,
    availableBeds: 8,
    status: 'limited',
    volunteers: 15,
    mealsAvailable: true,
    checkInTime: '6:00 PM',
    checkOutTime: '6:00 AM',
    coordinates: { lat: 28.6669, lng: 77.228 },
    amenities: ['Blankets', 'Meals', 'Toilets', 'WiFi', 'Medical Aid'],
    phone: '+91-11-23456005',
  },
  {
    id: '6',
    name: 'Govt. Primary School - Jama Masjid',
    address: 'Near Jama Masjid, Old Delhi',
    totalBeds: 90,
    availableBeds: 25,
    status: 'available',
    volunteers: 7,
    mealsAvailable: true,
    checkInTime: '6:00 PM',
    checkOutTime: '6:00 AM',
    coordinates: { lat: 28.6507, lng: 77.2334 },
    amenities: ['Blankets', 'Meals', 'Toilets'],
    phone: '+91-11-23456006',
  },
  {
    id: '7',
    name: 'Govt. Co-ed School - Connaught Place',
    address: 'Near Connaught Place, Central Delhi',
    totalBeds: 110,
    availableBeds: 45,
    status: 'available',
    volunteers: 9,
    mealsAvailable: true,
    checkInTime: '6:00 PM',
    checkOutTime: '6:00 AM',
    coordinates: { lat: 28.6315, lng: 77.2167 },
    amenities: ['Blankets', 'Meals', 'Toilets', 'Hygiene Kits'],
    phone: '+91-11-23456007',
  },
  {
    id: '8',
    name: 'Govt. Girls School - Chandni Chowk',
    address: 'Chandni Chowk, Old Delhi',
    totalBeds: 75,
    availableBeds: 12,
    status: 'limited',
    volunteers: 5,
    mealsAvailable: true,
    checkInTime: '6:00 PM',
    checkOutTime: '6:00 AM',
    coordinates: { lat: 28.6562, lng: 77.2301 },
    amenities: ['Blankets', 'Meals', 'Toilets'],
    phone: '+91-11-23456008',
  },
];

export const mockDashboardStats: DashboardStats = {
  totalCheckIns: 2847,
  activeShelters: 8,
  availableBeds: 185,
  registeredWristbands: 1542,
};

export const mockWristbandProfile: WristbandProfile = {
  id: '1',
  wristbandId: 'NN-USER-0847',
  lastCheckIn: '2024-01-14',
  lastShelter: 'Govt. Boys Sr. Sec. School - Sarai Kale Khan',
  healthNotes: [
    'Sensitive to cold - prefers lower bunk',
    'Mild seasonal allergies',
  ],
  checkInCount: 23,
  recommendedShelter: mockShelters[0],
};

// Default location for Delhi (India Gate area)
const DEFAULT_USER_LOCATION = { lat: 28.6129, lng: 77.2295 };

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
