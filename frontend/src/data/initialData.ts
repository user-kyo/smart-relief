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
    title: 'Severe Flooding along Riverview Sector',
    description: 'Rapidly rising floodwaters reaching 1.8m trapping residents on rooftops. Rescue boats urgently needed.',
    type: 'FLOOD',
    severity: 'CRITICAL',
    status: 'VERIFIED',
    locationName: 'Riverview Subdivision, Sector 4',
    barangay: 'Pauli 2',
    lguName: 'Rizal',
    lat: 14.1134,
    lng: 121.3938,
    affectedCount: 45,
    reportedBy: 'Carlos Dalisay',
    reportedByPhone: '+63 921 567 8901',
    reportedAt: '2026-08-11T05:30:00Z',
    updatedAt: '2026-08-11T05:45:00Z',
    assignedResponderIds: ['resp-001'],
    assignedResponderNames: ['Marcus Villareal (ALPHA-1)'],
    timeline: [
      {
        timestamp: '05:30 AM',
        action: 'Incident Logged',
        performedBy: 'Citizen Carlos Dalisay',
        notes: 'Reported via SmartRelief mobile portal'
      },
      {
        timestamp: '05:40 AM',
        action: 'Status Verified',
        performedBy: 'Admin Elena Santos',
        notes: 'Satellite and drone telemetry confirms critical flash flood'
      }
    ]
  },
  {
    id: 'INC-2026-092',
    title: 'Hillside Slope Debris & Mud Spill',
    description: 'Heavy rains triggered an earth slide blocking the primary access road along Kilometer 14.',
    type: 'LANDSLIDE',
    severity: 'HIGH',
    status: 'ASSIGNED',
    locationName: 'Kilometer 14 Mountain Road',
    barangay: 'Antipolo Central',
    lguName: 'Rizal',
    lat: 14.1190,
    lng: 121.4020,
    affectedCount: 20,
    reportedBy: 'Grace Bautista',
    reportedByPhone: '+63 922 678 9012',
    reportedAt: '2026-08-11T06:15:00Z',
    updatedAt: '2026-08-11T06:30:00Z',
    assignedResponderIds: ['resp-002'],
    assignedResponderNames: ['Delta Logistics Squad'],
    timeline: [
      {
        timestamp: '06:15 AM',
        action: 'Incident Logged',
        performedBy: 'Grace Bautista',
        notes: 'Debris completely impassable for standard vehicles'
      }
    ]
  },
  {
    id: 'INC-2026-095',
    title: 'Electrical Transformer Arc & Smoke',
    description: 'Power transformer damaged by fallen tree limbs sparked flames near residential cluster. Area isolated.',
    type: 'FIRE',
    severity: 'MEDIUM',
    status: 'REPORTED',
    locationName: 'Corner San Isidro St.',
    barangay: 'Pauli 1',
    lguName: 'Rizal',
    lat: 14.1110,
    lng: 121.3910,
    affectedCount: 8,
    reportedBy: 'Arnel Reyes',
    reportedByPhone: '+63 923 789 0123',
    reportedAt: '2026-08-11T07:05:00Z',
    updatedAt: '2026-08-11T07:05:00Z',
    assignedResponderIds: [],
    timeline: []
  },
  {
    id: 'INC-2026-098',
    title: 'Community Clinic Surge & Power Loss',
    description: 'Local health station overwhelmed with acute respiratory and trauma cases. Backup diesel generator failed.',
    type: 'MEDICAL',
    severity: 'HIGH',
    status: 'VERIFIED',
    locationName: 'Pauli 2 Health Station',
    barangay: 'Pauli 2',
    lguName: 'Rizal',
    lat: 14.1145,
    lng: 121.3960,
    affectedCount: 32,
    reportedBy: 'Elena Santos',
    reportedByPhone: '+63 918 234 5678',
    reportedAt: '2026-08-11T07:40:00Z',
    updatedAt: '2026-08-11T07:50:00Z',
    assignedResponderIds: ['resp-004'],
    assignedResponderNames: ['Theresa Ramos (MEDIC-1)'],
    timeline: []
  }
];

export const initialAssistanceRequests: AssistanceRequest[] = [
  {
    id: 'REQ-8801',
    incidentId: 'INC-2026-089',
    citizenName: 'Carlos Dalisay',
    citizenPhone: '+63 921 567 8901',
    requestType: 'RESCUE',
    severity: 'CRITICAL',
    status: 'ASSIGNED',
    locationName: 'Block 7 Lot 12 Riverview',
    barangay: 'Pauli 2',
    lat: 14.1136,
    lng: 121.3940,
    peopleCount: 4,
    specialNeeds: '1 elderly with wheelchair, 1 infant',
    description: 'Water level is waist-high inside the house. Need boat extraction to Pauli 2 evacuation center.',
    submittedAt: '2026-08-11T05:35:00Z',
    updatedAt: '2026-08-11T05:50:00Z',
    assignedResponderId: 'resp-001',
    assignedResponderName: 'Marcus Villareal (ALPHA-1)',
    statusHistory: [
      {
        status: 'SUBMITTED',
        timestamp: '05:35 AM',
        note: 'Assistance request logged by citizen'
      },
      {
        status: 'ASSIGNED',
        timestamp: '05:50 AM',
        note: 'Assigned to Alpha Swift Water Rescue'
      }
    ]
  },
  {
    id: 'REQ-8802',
    incidentId: 'INC-2026-089',
    citizenName: 'Grace Bautista',
    citizenPhone: '+63 922 678 9012',
    requestType: 'MEDICAL',
    severity: 'HIGH',
    status: 'VERIFIED',
    locationName: 'Pauli 2 Medical Outpost',
    barangay: 'Pauli 2',
    lat: 14.1142,
    lng: 121.3948,
    peopleCount: 2,
    specialNeeds: 'Diabetic patient needing refrigerated insulin',
    description: 'Power cut off in neighborhood. Patient experiencing heat exhaustion and requires cold chain insulin.',
    submittedAt: '2026-08-11T06:20:00Z',
    updatedAt: '2026-08-11T06:35:00Z',
    assignedResponderId: 'resp-004',
    assignedResponderName: 'Theresa Ramos (MEDIC-1)',
    statusHistory: [
      {
        status: 'SUBMITTED',
        timestamp: '06:20 AM',
        note: 'Medical request registered'
      }
    ]
  },
  {
    id: 'REQ-8803',
    citizenName: 'Arnel Reyes',
    citizenPhone: '+63 923 789 0123',
    requestType: 'FOOD_WATER',
    severity: 'MEDIUM',
    status: 'SUBMITTED',
    locationName: 'Poblacion Barangay Hall Annex',
    barangay: 'Poblacion',
    lat: 14.1105,
    lng: 121.3890,
    peopleCount: 6,
    specialNeeds: 'Drinking water & baby milk formula',
    description: 'Tap water contaminated by runoff. 6 family members isolated without drinking water.',
    submittedAt: '2026-08-11T06:55:00Z',
    updatedAt: '2026-08-11T06:55:00Z',
    statusHistory: [
      {
        status: 'SUBMITTED',
        timestamp: '06:55 AM',
        note: 'Supplies request queued'
      }
    ]
  },
  {
    id: 'REQ-8804',
    citizenName: 'Maria Santos',
    citizenPhone: '+63 917 888 2345',
    requestType: 'TRANSPORT',
    severity: 'MEDIUM',
    status: 'VERIFIED',
    locationName: 'San Isidro Chapel Crossing',
    barangay: 'Pauli 1',
    lat: 14.1120,
    lng: 121.3915,
    peopleCount: 3,
    specialNeeds: 'Non-ambulatory senior citizen',
    description: 'Flood rising slowly, seeking preemptive evacuation ride to Pauli 2 Covered Court.',
    submittedAt: '2026-08-11T07:10:00Z',
    updatedAt: '2026-08-11T07:25:00Z',
    statusHistory: []
  },
  {
    id: 'REQ-8805',
    citizenName: 'Danilo Cruz',
    citizenPhone: '+63 919 777 4567',
    requestType: 'SHELTER',
    severity: 'LOW',
    status: 'SUBMITTED',
    locationName: 'Antipolo Upper Ridge',
    barangay: 'Antipolo Central',
    lat: 14.1225,
    lng: 121.4080,
    peopleCount: 5,
    specialNeeds: 'Displaced due to roof tear',
    description: 'Gale wind gusts tore galvanized roofing. Seeking emergency bunk assignment.',
    submittedAt: '2026-08-11T07:30:00Z',
    updatedAt: '2026-08-11T07:30:00Z',
    statusHistory: []
  }
];

export const initialEvacuationCenters: EvacuationCenter[] = [
  {
    id: 'EC-001',
    name: 'Pauli 2 Central Covered Gymnasium',
    capacity: 500,
    currentOccupants: 380,
    status: 'OPEN',
    address: 'Pauli 2 Barangay Sports Complex',
    barangay: 'Pauli 2',
    lguName: 'Rizal',
    lat: 14.1150,
    lng: 121.3950,
    facilities: {
      powerGenerator: true,
      medicalStation: true,
      sanitation: true,
      wifiComm: true,
      communityKitchen: true,
      waterPurifier: true
    },
    contactPerson: 'Elena Santos',
    contactPhone: '+63 918 234 5678',
    updatedAt: '2026-08-11T06:45:00Z'
  },
  {
    id: 'EC-002',
    name: 'Rizal Municipal Multi-Purpose Center',
    capacity: 400,
    currentOccupants: 385,
    status: 'FULL',
    address: 'Town Plaza, Poblacion',
    barangay: 'Poblacion',
    lguName: 'Rizal',
    lat: 14.1102,
    lng: 121.3885,
    facilities: {
      powerGenerator: true,
      medicalStation: true,
      sanitation: true,
      wifiComm: false,
      communityKitchen: true,
      waterPurifier: true
    },
    contactPerson: 'Marcus Villareal',
    contactPhone: '+63 919 345 6789',
    updatedAt: '2026-08-11T06:30:00Z'
  },
  {
    id: 'EC-003',
    name: 'Antipolo East Elementary School Hub',
    capacity: 350,
    currentOccupants: 110,
    status: 'OPEN',
    address: 'School Road, Antipolo Central',
    barangay: 'Antipolo Central',
    lguName: 'Rizal',
    lat: 14.1210,
    lng: 121.4060,
    facilities: {
      powerGenerator: false,
      medicalStation: true,
      sanitation: true,
      wifiComm: false,
      communityKitchen: false,
      waterPurifier: true
    },
    contactPerson: 'Theresa Ramos',
    contactPhone: '+63 920 456 7890',
    updatedAt: '2026-08-11T07:15:00Z'
  },
  {
    id: 'EC-004',
    name: 'San Isidro Civic Auditorium (Standby)',
    capacity: 300,
    currentOccupants: 0,
    status: 'STANDBY',
    address: 'San Isidro Memorial Park Road',
    barangay: 'Pauli 1',
    lguName: 'Rizal',
    lat: 14.1080,
    lng: 121.3920,
    facilities: {
      powerGenerator: true,
      medicalStation: false,
      sanitation: true,
      wifiComm: false,
      communityKitchen: false,
      waterPurifier: false
    },
    contactPerson: 'Carlos Dalisay',
    contactPhone: '+63 921 567 8901',
    updatedAt: '2026-08-11T05:00:00Z'
  }
];

export const initialResponders: Responder[] = [
  {
    id: 'resp-001',
    name: 'Marcus Villareal',
    codeName: 'ALPHA-1',
    roleType: 'DISASTER_RESPONSE_TEAM',
    status: 'ON_SCENE',
    lguName: 'Rizal',
    locationName: 'Sector 4 Riverview Post',
    lat: 14.1132,
    lng: 121.3935,
    phone: '+63 919 345 6789',
    teamSize: 6,
    skills: ['Water Rescue', 'First Aid', 'Swift Water Rescue'],
    equipment: ['Rubber Boat', 'Life Vests (15)', 'Medical Trauma Kit'],
    lastPing: '1 min ago'
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
    teamSize: 8,
    skills: ['Heavy Machinery', 'Route Clearing', 'Supply Transport'],
    equipment: ['Bulldozer', 'Chainsaws', 'Utility Truck'],
    lastPing: '3 mins ago'
  },
  {
    id: 'resp-003',
    name: 'Theresa Ramos',
    codeName: 'MEDIC-1',
    roleType: 'PARAMEDIC',
    status: 'AVAILABLE',
    lguName: 'Rizal',
    locationName: 'Antipolo Medical Outpost',
    lat: 14.1200,
    lng: 121.4050,
    phone: '+63 920 456 7890',
    teamSize: 4,
    skills: ['Triage', 'Emergency Medicine', 'Advanced Trauma Care'],
    equipment: ['Ambulance', 'Defibrillator', 'Oxygen Resuscitator'],
    lastPing: 'Just now'
  },
  {
    id: 'resp-004',
    name: 'Bravo Swift Rescue Team',
    codeName: 'BRAVO-1',
    roleType: 'DISASTER_RESPONSE_TEAM',
    status: 'EN_ROUTE',
    lguName: 'Rizal',
    locationName: 'Approaching Pauli 2 Crossway',
    lat: 14.1160,
    lng: 121.3970,
    phone: '+63 918 333 4455',
    teamSize: 5,
    skills: ['Night Navigation', 'Rope Rigging', 'Submerged Extraction'],
    equipment: ['Rigid Inflatable Boat', 'Thermal Cameras', 'Rescue Pulleys'],
    lastPing: '4 mins ago'
  },
  {
    id: 'resp-005',
    name: 'K9 Search & Locator Unit',
    codeName: 'K9-SAR',
    roleType: 'FIRE_RESCUE',
    status: 'AVAILABLE',
    lguName: 'Rizal',
    locationName: 'Municipal Base Alpha',
    lat: 14.1105,
    lng: 121.3900,
    phone: '+63 917 222 7890',
    teamSize: 3,
    skills: ['Canine Tracking', 'Scent Locating', 'Mudslide Detection'],
    equipment: ['Trained Dogs (2)', 'GPS Collars', 'Field Medical Pack'],
    lastPing: '7 mins ago'
  }
];

export const initialResources: ResourceItem[] = [
  {
    id: 'INV-101',
    name: 'Standard Family Food Packs',
    category: 'FOOD_WATER',
    quantity: 1200,
    availableQuantity: 950,
    reservedQuantity: 150,
    distributedQuantity: 100,
    unit: 'boxes',
    location: 'Central Warehouse Depot',
    lguName: 'Rizal',
    minThreshold: 200,
    lastUpdated: '2026-08-11T06:00:00Z',
    stockStatus: 'NORMAL'
  },
  {
    id: 'INV-102',
    name: 'Purified Drinking Water (5-Gallon)',
    category: 'FOOD_WATER',
    quantity: 300,
    availableQuantity: 45,
    reservedQuantity: 155,
    distributedQuantity: 100,
    unit: 'containers',
    location: 'Pauli 2 Central Depot',
    lguName: 'Rizal',
    minThreshold: 100,
    lastUpdated: '2026-08-11T05:30:00Z',
    stockStatus: 'LOW_STOCK'
  },
  {
    id: 'INV-103',
    name: 'Emergency Trauma & First Aid Kit',
    category: 'MEDICAL_SUPPLIES',
    quantity: 150,
    availableQuantity: 120,
    reservedQuantity: 20,
    distributedQuantity: 10,
    unit: 'kits',
    location: 'Antipolo Medical Hub',
    lguName: 'Rizal',
    minThreshold: 30,
    lastUpdated: '2026-08-11T06:15:00Z',
    stockStatus: 'NORMAL'
  },
  {
    id: 'INV-104',
    name: 'Heavy-Duty Inflatable Raft (8-Person)',
    category: 'RESCUE_GEAR',
    quantity: 12,
    availableQuantity: 3,
    reservedQuantity: 5,
    distributedQuantity: 4,
    unit: 'crafts',
    location: 'Riverview Staging Area',
    lguName: 'Rizal',
    minThreshold: 5,
    lastUpdated: '2026-08-11T05:45:00Z',
    stockStatus: 'LOW_STOCK'
  },
  {
    id: 'INV-105',
    name: 'Certified Life Vests (Adult & Child)',
    category: 'RESCUE_GEAR',
    quantity: 250,
    availableQuantity: 190,
    reservedQuantity: 40,
    distributedQuantity: 20,
    unit: 'vests',
    location: 'Sector 4 Staging Depot',
    lguName: 'Rizal',
    minThreshold: 50,
    lastUpdated: '2026-08-11T06:00:00Z',
    stockStatus: 'NORMAL'
  },
  {
    id: 'INV-106',
    name: 'Portable Diesel Generator 5.5kW',
    category: 'POWER_COMM',
    quantity: 8,
    availableQuantity: 2,
    reservedQuantity: 3,
    distributedQuantity: 3,
    unit: 'units',
    location: 'Central Warehouse Depot',
    lguName: 'Rizal',
    minThreshold: 4,
    lastUpdated: '2026-08-11T04:30:00Z',
    stockStatus: 'CRITICAL'
  },
  {
    id: 'INV-107',
    name: 'Family Hygiene & Sanitation Packs',
    category: 'HYGIENE_KITS',
    quantity: 600,
    availableQuantity: 510,
    reservedQuantity: 50,
    distributedQuantity: 40,
    unit: 'packs',
    location: 'Pauli 2 Central Depot',
    lguName: 'Rizal',
    minThreshold: 100,
    lastUpdated: '2026-08-11T05:10:00Z',
    stockStatus: 'NORMAL'
  },
  {
    id: 'INV-108',
    name: 'Thermal Emergency Blankets',
    category: 'CLOTHING_BEDDING',
    quantity: 800,
    availableQuantity: 620,
    reservedQuantity: 80,
    distributedQuantity: 100,
    unit: 'pieces',
    location: 'Central Warehouse Depot',
    lguName: 'Rizal',
    minThreshold: 150,
    lastUpdated: '2026-08-11T05:00:00Z',
    stockStatus: 'NORMAL'
  }
];

export const initialUsers: SystemUser[] = [
  {
    id: 'usr-001',
    email: 'roberto.mendoza@gmail.com',
    name: 'Roberto Mendoza',
    role: 'SUPER_ADMIN',
    phone: '+63 917 123 4567',
    status: 'ACTIVE',
    lastActive: '2026-08-11T05:30:00Z'
  },
  {
    id: 'usr-002',
    email: 'elena.santos@gmail.com',
    name: 'Elena Santos',
    role: 'ADMIN',
    phone: '+63 918 234 5678',
    status: 'ACTIVE',
    lastActive: '2026-08-11T05:30:00Z'
  },
  {
    id: 'usr-003',
    email: 'marcus.villareal@gmail.com',
    name: 'Marcus Villareal',
    role: 'RESPONDER',
    phone: '+63 919 345 6789',
    status: 'ACTIVE',
    lastActive: '2026-08-11T05:30:00Z'
  },
  {
    id: 'usr-004',
    email: 'theresa.ramos@gmail.com',
    name: 'Theresa Ramos',
    role: 'RESPONDER',
    phone: '+63 920 456 7890',
    status: 'ACTIVE',
    lastActive: '2026-08-11T05:30:00Z'
  },
  {
    id: 'usr-005',
    email: 'carlos.dalisay@gmail.com',
    name: 'Carlos Dalisay',
    role: 'CITIZEN',
    phone: '+63 921 567 8901',
    status: 'ACTIVE',
    lastActive: '2026-08-11T05:30:00Z'
  },
  {
    id: 'usr-006',
    email: 'grace.bautista@gmail.com',
    name: 'Grace Bautista',
    role: 'CITIZEN',
    phone: '+63 922 678 9012',
    status: 'ACTIVE',
    lastActive: '2026-08-11T05:30:00Z'
  },
  {
    id: 'usr-007',
    email: 'arnel.reyes@gmail.com',
    name: 'Arnel Reyes',
    role: 'CITIZEN',
    phone: '+63 923 789 0123',
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
    drrmHead: 'Mayor Vener Munoz',
    contactEmail: 'drrm@rizallaguna.gov.ph',
    contactPhone: '+63 49 562 1111',
    status: 'ACTIVE'
  }
];

export const initialLogs: SystemLog[] = [];

export const initialRolePermissions: RolePermission[] = [
  {
    role: "SUPER_ADMIN",
    description: "Full system access and configuration",
    permissions: {
      incidentsCreate: true,
      incidentsVerify: true,
      incidentsAssign: true,
      incidentsDelete: true,
      requestsManage: true,
      resourcesAdd: true,
      resourcesTransfer: true,
      evacuationManage: true,
      usersManage: true,
      rolesManage: true,
      systemLogsView: true,
    }
  },
  {
    role: "ADMIN",
    description: "LGU and operational management",
    permissions: {
      incidentsCreate: true,
      incidentsVerify: true,
      incidentsAssign: true,
      incidentsDelete: true,
      requestsManage: true,
      resourcesAdd: true,
      resourcesTransfer: true,
      evacuationManage: true,
      usersManage: true,
      rolesManage: false,
      systemLogsView: true,
    }
  },
  {
    role: "RESPONDER",
    description: "On-ground incident response",
    permissions: {
      incidentsCreate: true,
      incidentsVerify: false,
      incidentsAssign: false,
      incidentsDelete: false,
      requestsManage: true,
      resourcesAdd: false,
      resourcesTransfer: true,
      evacuationManage: true,
      usersManage: false,
      rolesManage: false,
      systemLogsView: false,
    }
  },
  {
    role: "CITIZEN",
    description: "Public reporting and assistance requests",
    permissions: {
      incidentsCreate: true,
      incidentsVerify: false,
      incidentsAssign: false,
      incidentsDelete: false,
      requestsManage: false,
      resourcesAdd: false,
      resourcesTransfer: false,
      evacuationManage: false,
      usersManage: false,
      rolesManage: false,
      systemLogsView: false,
    }
  }
];

export const initialAIRecommendations: AIRecommendation[] = [
  {
    id: "rec-ai-001",
    title: "Priority Evacuation Dispatch: Riverview Sector 4",
    severity: "CRITICAL",
    reasoning: "Water level is surging towards 2.0 meters along Riverview. 45 citizens reported trapped on rooftops, including high-risk infants and seniors. Immediate watercraft dispatch is required before nightfall.",
    recommendedAction: "Authorize immediate deployment of Alpha Swift Water Unit with 2 inflatable motorboats to Riverview Block 7 staging point.",
    impactScore: 96,
    category: "DISPATCH",
    status: "PENDING",
    targetId: "INC-2026-089"
  },
  {
    id: "rec-ai-002",
    title: "Urgent Drinking Water Resupply: Pauli 2 Hub",
    severity: "HIGH",
    reasoning: "Current potable water stockpile at Pauli 2 Depot dropped to 45 containers (well below 100 threshold) while occupant influx at Pauli 2 Gym reached 380 people.",
    recommendedAction: "Initiate emergency inter-depot transfer of 80 5-gallon water containers from Central Warehouse to Pauli 2 Hub.",
    impactScore: 89,
    category: "RESOURCE_ALLOCATION",
    status: "PENDING",
    targetId: "INV-102"
  },
  {
    id: "rec-ai-003",
    title: "Medical Triage Reinforcement: Antipolo Outpost",
    severity: "HIGH",
    reasoning: "Secondary road clearance operations underway along Kilometer 14. Paramedic Unit 1 deployed for trauma readiness.",
    recommendedAction: "Dispatch Theresa Ramos (MEDIC-1) with portable defibrillator and trauma kits to provide on-scene medical standby.",
    impactScore: 84,
    category: "DISPATCH",
    status: "ACCEPTED",
    targetId: "resp-003"
  },
  {
    id: "rec-ai-004",
    title: "Shelter Overflow Re-routing: Municipal Multi-Purpose Center",
    severity: "MEDIUM",
    reasoning: "Rizal Municipal Center reached 96% occupancy (385/400). High risk of overcrowding and sanitary pressure if incoming evacuees are not diverted.",
    recommendedAction: "Redirect incoming evacuee transports from Poblacion sector directly to Antipolo East Elementary School Hub.",
    impactScore: 78,
    category: "EVACUATION",
    status: "PENDING",
    targetId: "EC-002"
  },
  {
    id: "rec-ai-005",
    title: "Pre-position Emergency Generators in Hillside Sector",
    severity: "LOW",
    reasoning: "Potential secondary line failure estimated by weather telemetry. Pre-positioning generators proposed.",
    recommendedAction: "Standby 1 5.5kW generator unit at San Isidro Station.",
    impactScore: 55,
    category: "ALERT",
    status: "REJECTED",
    targetId: "INV-106"
  }
];

export const initialAlerts: EmergencyAlert[] = [
  {
    id: "ALT-001",
    title: "RED FLOOD WARNING - Sector 4 River Basin",
    affectedArea: "Pauli 2 & Pauli 1, Rizal",
    instructions: "Riverside evacuation strongly advised. Move to Pauli 2 Covered Gymnasium.",
    severity: "CRITICAL",
    issuedAt: "2026-08-11T05:00:00Z",
    issuedBy: "Rizal DRRM Operations Center",
    active: true
  }
];
