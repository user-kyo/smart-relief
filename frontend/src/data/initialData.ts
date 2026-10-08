import { 
  Incident, 
  AssistanceRequest, 
  EvacuationCenter, 
  Responder, 
  ResourceItem, 
  SystemUser, 
  SystemLog, 
  RolePermission, 
  LGUOrganization, 
  AIRecommendation, 
  EmergencyAlert 
} from '../types';

export const initialIncidents: Incident[] = [
  {
    id: 'INC-2026-089',
    title: 'Severe Flooding in Sector 4',
    description: 'Rapidly rising floodwaters trapping residents on rooftops. Rescue teams urgently needed.',
    type: 'FLOOD',
    severity: 'CRITICAL',
    status: 'VERIFIED',
    locationName: 'Riverview Subd',
    barangay: 'Pauli 2',
    lguName: 'Rizal',
    lat: 14.1134,
    lng: 121.3938,
    affectedCount: 50,
    reportedBy: 'usr-004',
    reportedAt: '2026-08-11T05:30:00Z',
    updatedAt: '2026-08-11T05:30:00Z',
    assignedResponderIds: ['resp-001'],
    timeline: []
  },
  {
    id: 'INC-2026-092',
    title: 'Landslide along Hillside',
    description: 'Heavy rains triggered a landslide blocking the main road. Clearing operations pending.',
    type: 'LANDSLIDE',
    severity: 'HIGH',
    status: 'REPORTED',
    locationName: 'Kilometer 14',
    barangay: 'Pauli 2',
    lguName: 'Rizal',
    lat: 14.1140,
    lng: 121.3945,
    affectedCount: 15,
    reportedBy: 'usr-004',
    reportedAt: '2026-08-11T06:15:00Z',
    updatedAt: '2026-08-11T06:15:00Z',
    assignedResponderIds: ['resp-002'],
    timeline: []
  }
];

export const initialAssistanceRequests: AssistanceRequest[] = [
  {
    id: 'REQ-8801',
    incidentId: 'INC-2026-089',
    citizenName: 'Ana Reyes',
    citizenPhone: '+63 917 555 1234',
    requestType: 'MEDICAL',
    severity: 'HIGH',
    status: 'SUBMITTED',
    locationName: 'Pauli 2 Medical Center',
    barangay: 'Pauli 2',
    lat: 14.1130,
    lng: 121.3930,
    peopleCount: 1,
    description: 'Elderly patient needs urgent evacuation due to rising waters.',
    submittedAt: '2026-08-11T06:45:00Z',
    updatedAt: '2026-08-11T06:45:00Z',
    statusHistory: []
  }
];

export const initialEvacuationCenters: EvacuationCenter[] = [
  {
    id: 'EC-001',
    name: 'Pauli 2 Evacuation Center',
    capacity: 500,
    currentOccupants: 440,
    status: 'OPEN',
    address: 'Pauli 2 Covered Court',
    barangay: 'Pauli 2',
    lguName: 'Rizal',
    lat: 14.1150,
    lng: 121.3950,
    facilities: {
      powerGenerator: true,
      medicalStation: true,
      sanitation: true,
      wifiComm: false,
      communityKitchen: true,
      waterPurifier: true
    },
    contactPerson: 'Kapt. Elena Santos',
    contactPhone: '+63 920 111 2233',
    updatedAt: '2026-08-11T06:45:00Z'
  }
];

export const initialResponders: Responder[] = [
  {
    id: 'resp-001',
    name: 'Alpha Swift Water Rescue Team',
    codeName: 'ALPHA-1',
    roleType: 'DISASTER_RESPONSE_TEAM',
    status: 'ON_SCENE',
    lguName: 'Rizal',
    locationName: 'Sector 4 Flood Zone',
    lat: 14.1132,
    lng: 121.3935,
    phone: '+63 919 555 0101',
    teamSize: 8,
    skills: ['Water Rescue', 'First Aid'],
    equipment: ['Inflatable Motorboat', 'Life Vests (20)'],
    lastPing: '2 mins ago'
  },
  {
    id: 'resp-002',
    name: 'Delta Logistics Squad',
    codeName: 'DELTA-1',
    roleType: 'DISASTER_RESPONSE_TEAM',
    status: 'AVAILABLE',
    lguName: 'Rizal',
    locationName: 'Rizal DRRM Operations Center',
    lat: 14.1125,
    lng: 121.3920,
    phone: '+63 919 555 0202',
    teamSize: 12,
    skills: ['Heavy Machinery', 'Route Clearing'],
    equipment: ['Bulldozer', 'Chainsaws'],
    lastPing: '5 mins ago'
  }
];

export const initialResources: ResourceItem[] = [
  {
    id: 'INV-101',
    name: 'Relief Food Pack',
    category: 'FOOD_WATER',
    quantity: 1200,
    availableQuantity: 1000,
    reservedQuantity: 200,
    distributedQuantity: 500,
    unit: 'boxes',
    location: 'Pauli 2 Central Depot',
    lguName: 'Rizal',
    minThreshold: 100,
    lastUpdated: '2026-08-11T06:00:00Z',
    stockStatus: 'NORMAL'
  },
  {
    id: 'INV-102',
    name: 'Drinking Water (5 Gal)',
    category: 'FOOD_WATER',
    quantity: 150,
    availableQuantity: 10,
    reservedQuantity: 140,
    distributedQuantity: 300,
    unit: 'containers',
    location: 'Pauli 2 Central Depot',
    lguName: 'Rizal',
    minThreshold: 100,
    lastUpdated: '2026-08-11T05:30:00Z',
    stockStatus: 'CRITICAL'
  }
];

export const initialUsers: SystemUser[] = [
  {
    id: 'usr-001',
    email: 'admin@smartrelief.com',
    name: 'Dr. Roberto Mendoza',
    role: 'SUPER_ADMIN',
    phone: '+63 900 000 0000',
    status: 'ACTIVE',
    lastActive: '2026-08-11T05:30:00Z'
  },
  {
    id: 'usr-002',
    email: 'admintest',
    name: 'Kapt. Elena Santos',
    role: 'ADMIN',
    phone: '+63 900 000 0001',
    status: 'ACTIVE',
    lastActive: '2026-08-11T05:30:00Z'
  },
  {
    id: 'usr-003',
    email: 'respondertest',
    name: 'Sgt. Mark Villareal',
    role: 'RESPONDER',
    phone: '+63 900 000 0002',
    status: 'ACTIVE',
    lastActive: '2026-08-11T05:30:00Z'
  },
  {
    id: 'usr-004',
    email: 'citizentest',
    name: 'Ana Reyes',
    role: 'CITIZEN',
    phone: '+63 900 000 0003',
    status: 'ACTIVE',
    lastActive: '2026-08-11T05:30:00Z'
  }
];

export const initialLGUs: LGUOrganization[] = [
  {
    id: 'lgu-101',
    name: 'Rizal DRRM Operations Center',
    region: 'CALABARZON (Region IV-A)',
    cityMunicipality: 'Rizal',
    barangayCount: 11,
    registeredRespondersCount: 45,
    drrmHead: 'Mayor Vener MuAoz',
    contactEmail: 'drrm@rizallaguna.gov.ph',
    contactPhone: '+63 49 562 1111',
    status: 'ACTIVE'
  }
];

export const initialLogs: SystemLog[] = [];
export const initialRolePermissions: RolePermission[] = [];
export const initialAIRecommendations: AIRecommendation[] = [];
export const initialAlerts: EmergencyAlert[] = [];
