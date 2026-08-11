import {
  Incident,
  AssistanceRequest,
  ResourceItem,
  EvacuationCenter,
  Responder,
  SystemUser,
  LGUOrganization,
  SystemLog,
  RolePermission,
  AIRecommendation,
  EmergencyAlert
} from "../types";

export const initialUsers: SystemUser[] = [
  {
    id: "usr-001",
    name: "Dr. Roberto Mendoza",
    email: "roberto.mendoza@drrm.gov.ph",
    phone: "+63 917 555 0101",
    role: "SUPER_ADMIN",
    status: "ACTIVE",
    lastActive: "2 mins ago",
    lguName: "National Disaster Risk Reduction Council",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "usr-002",
    name: "Kapt. Elena Santos",
    email: "elena.santos@manila.gov.ph",
    phone: "+63 918 555 0202",
    role: "ADMIN",
    status: "ACTIVE",
    lguId: "lgu-101",
    lguName: "San Pablo City DRRM Operations Center",
    barangay: "Barangay San Lucas 1",
    lastActive: "Just now",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "usr-003",
    name: "Sgt. Mark Villareal",
    email: "m.villareal@responder.drrm.ph",
    phone: "+63 919 555 0303",
    role: "RESPONDER",
    status: "ACTIVE",
    lguId: "lgu-101",
    lguName: "Rescue Alpha Team",
    skills: ["Water Rescue", "EMT Paramedic", "Heavy Rigging"],
    lastActive: "1 min ago",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "usr-004",
    name: "Ana Reyes",
    email: "maria.cruz@gmail.com",
    phone: "+63 920 555 0404",
    role: "CITIZEN",
    status: "ACTIVE",
    barangay: "Barangay San Jose",
    lastActive: "5 mins ago",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "usr-005",
    name: "Juan Dela Cruz",
    email: "j.delacruz@redcross.org.ph",
    phone: "+63 921 555 0505",
    role: "VOLUNTEER",
    status: "ACTIVE",
    skills: ["First Aid", "Food Logistics", "Evacuation Registration"],
    lastActive: "12 mins ago"
  }
];

export const initialIncidents: Incident[] = [
  {
    id: "INC-2026-089",
    title: "Severe Flash Flood & Trapped Residents",
    description: "Rising floodwaters reached 1.8 meters in low-lying area. Multiple households trapped on rooftops near riverbank.",
    type: "FLOOD",
    severity: "CRITICAL",
    status: "RESPONDING",
    locationName: "Riverview Subdivision, Barangay San Jose",
    barangay: "Barangay San Jose",
    lguName: "San Pablo City DRRM Operations Center",
    lat: 14.0765, // Near Sampaloc Lake
    lng: 121.3258,
    affectedCount: 28,
    reportedBy: "Ana Reyes (Resident)",
    reportedByPhone: "+63 920 555 0404",
    reportedAt: "2026-08-11T06:15:00Z",
    updatedAt: "2026-08-11T06:45:00Z",
    assignedResponderIds: ["resp-001"],
    assignedResponderNames: ["Alpha Swift Water Rescue Team"],
    relatedRequestIds: ["REQ-8801", "REQ-8802"],
    timeline: [
      { timestamp: "06:15 AM", action: "Citizen report submitted with photo evidence.", performedBy: "Ana Reyes" },
      { timestamp: "06:22 AM", action: "Incident verified by LGU-DRRM Command.", performedBy: "Kapt. Elena Santos" },
      { timestamp: "06:30 AM", action: "AI recommended immediate dispatch of Rescue Alpha Team.", performedBy: "SmartRelief AI Engine" },
      { timestamp: "06:35 AM", action: "Assigned Alpha Swift Water Rescue Team (2 inflatable boats).", performedBy: "Kapt. Elena Santos" },
      { timestamp: "06:45 AM", action: "Rescue Alpha Team confirmed en route.", performedBy: "Sgt. Mark Villareal" }
    ]
  },
  {
    id: "INC-2026-090",
    title: "Structural Collapsed Wall near Market",
    description: "Perimeter wall collapsed blocking main access route. Partial power line entanglement.",
    type: "STRUCTURE_COLLAPSE",
    severity: "HIGH",
    status: "VERIFIED",
    locationName: "Public Market Ave, Barangay 1-A",
    barangay: "Barangay 1-A",
    lguName: "San Pablo City DRRM Operations Center",
    lat: 14.0720, // San Pablo City Proper Market
    lng: 121.3242,
    affectedCount: 12,
    reportedBy: "Barangay Tanod Officer",
    reportedAt: "2026-08-11T06:00:00Z",
    updatedAt: "2026-08-11T06:20:00Z",
    assignedResponderIds: ["resp-002"],
    assignedResponderNames: ["Bravo Fire & Heavy Rescue"],
    timeline: [
      { timestamp: "06:00 AM", action: "Incident reported by Barangay Patrol.", performedBy: "Officer Benitez" },
      { timestamp: "06:20 AM", action: "Severity set to HIGH due to power line risk.", performedBy: "Kapt. Elena Santos" }
    ]
  },
  {
    id: "INC-2026-091",
    title: "Medical Emergency - Heat Exhaustion & Asthma in Evacuation Center",
    description: "Multiple evacuees suffering respiratory distress due to high humidity and overcrowding.",
    type: "MEDICAL",
    severity: "MEDIUM",
    status: "ASSIGNED",
    locationName: "Central Gym Evacuation Center",
    barangay: "Barangay San Lucas 1",
    lguName: "San Pablo City DRRM Operations Center",
    lat: 14.0610, // Near SM City San Pablo
    lng: 121.3195,
    affectedCount: 6,
    reportedBy: "Center Manager",
    reportedAt: "2026-08-11T05:30:00Z",
    updatedAt: "2026-08-11T06:10:00Z",
    assignedResponderIds: ["resp-003"],
    assignedResponderNames: ["Charlie Paramedic Unit"],
    timeline: [
      { timestamp: "05:30 AM", action: "Evacuation Center medical alert raised.", performedBy: "Volunteer Supervisor" },
      { timestamp: "06:10 AM", action: "Assigned Paramedic Unit 3 with portable oxygen concentrators.", performedBy: "Kapt. Elena Santos" }
    ]
  },
  {
    id: "INC-2026-092",
    title: "Landslide Risk on Hillside Access Road",
    description: "Cracks observed along mountain slope road following 6 hours of relentless downpour.",
    type: "LANDSLIDE",
    severity: "HIGH",
    status: "REPORTED",
    locationName: "Hillside Road Kilometer 14",
    barangay: "Barangay San Vicente",
    lguName: "San Pablo City DRRM Operations Center",
    lat: 14.0850, // Towards Mount Makiling / Hillside
    lng: 121.3380,
    affectedCount: 45,
    reportedBy: "LGU Highway Inspector",
    reportedAt: "2026-08-11T06:40:00Z",
    updatedAt: "2026-08-11T06:40:00Z",
    assignedResponderIds: [],
    timeline: [
      { timestamp: "06:40 AM", action: "Inspector logged pre-disaster landslide warning indicator.", performedBy: "Inspector Santos" }
    ]
  }
];

export const initialAssistanceRequests: AssistanceRequest[] = [
  {
    id: "REQ-8801",
    citizenName: "Ana Reyes",
    citizenPhone: "+63 920 555 0404",
    requestType: "RESCUE",
    severity: "CRITICAL",
    locationName: "House #42, Riverview Subdivision, Barangay San Jose",
    barangay: "Barangay San Jose",
    lat: 14.0768, // Request near Incident 1 (Sampaloc Lake)
    lng: 121.3260,
    peopleCount: 5,
    specialNeeds: "1 Senior Citizen with mobility impairment, 1 Infant (8 months)",
    description: "Flood water reached chest level on ground floor. We are on rooftop. Need immediate boat rescue.",
    status: "RESPONDING",
    submittedAt: "2026-08-11T06:15:00Z",
    updatedAt: "2026-08-11T06:45:00Z",
    assignedResponderId: "resp-001",
    assignedResponderName: "Alpha Swift Water Rescue Team",
    incidentId: "INC-2026-089",
    statusHistory: [
      { status: "SUBMITTED", timestamp: "06:15 AM", note: "Request received via Citizen App" },
      { status: "VERIFIED", timestamp: "06:22 AM", note: "Priority elevated to CRITICAL due to infant and senior citizen" },
      { status: "ASSIGNED", timestamp: "06:35 AM", note: "Assigned to Rescue Alpha Team" },
      { status: "RESPONDING", timestamp: "06:45 AM", note: "Responders en route with motorboat" }
    ]
  },
  {
    id: "REQ-8802",
    citizenName: "Carlos Garcia",
    citizenPhone: "+63 915 888 2211",
    requestType: "FOOD_WATER",
    severity: "HIGH",
    locationName: "Barangay Hall Annex, Barangay San Jose",
    barangay: "Barangay San Jose",
    lat: 14.0755,
    lng: 121.3250,
    peopleCount: 18,
    specialNeeds: "Clean drinking water exhausted",
    description: "18 evacuees stranded in barangay annex hall. Water supplies ran out 2 hours ago.",
    status: "VERIFIED",
    submittedAt: "2026-08-11T06:05:00Z",
    updatedAt: "2026-08-11T06:25:00Z",
    statusHistory: [
      { status: "SUBMITTED", timestamp: "06:05 AM", note: "Request submitted" },
      { status: "VERIFIED", timestamp: "06:25 AM", note: "LGU verified location and headcount" }
    ]
  },
  {
    id: "REQ-8803",
    citizenName: "Maria Fernandez",
    citizenPhone: "+63 922 999 1100",
    requestType: "MEDICAL",
    severity: "HIGH",
    locationName: "Corner 4th & Laurel St, Barangay San Lucas 1",
    barangay: "Barangay San Lucas 1",
    lat: 14.0620, // Near SM San Pablo (Medical Request)
    lng: 121.3190,
    peopleCount: 2,
    specialNeeds: "Laceration injury requiring sutures",
    description: "Resident cut leg on floating debris while wading through floodwater.",
    status: "ASSIGNED",
    submittedAt: "2026-08-11T05:50:00Z",
    updatedAt: "2026-08-11T06:10:00Z",
    assignedResponderId: "resp-003",
    assignedResponderName: "Charlie Paramedic Unit",
    statusHistory: [
      { status: "SUBMITTED", timestamp: "05:50 AM", note: "Request submitted" },
      { status: "VERIFIED", timestamp: "06:00 AM", note: "Triage confirmed paramedic required" },
      { status: "ASSIGNED", timestamp: "06:10 AM", note: "Charlie Paramedic assigned" }
    ]
  }
];

export const initialResources: ResourceItem[] = [
  {
    id: "RES-101",
    name: "Ready-to-Eat Emergency Family Food Packs",
    category: "FOOD_WATER",
    quantity: 1250,
    availableQuantity: 820,
    reservedQuantity: 200,
    distributedQuantity: 230,
    unit: "packs",
    location: "Central LGU Logistics Warehouse",
    lguName: "San Pablo City DRRM Operations Center",
    minThreshold: 300,
    stockStatus: "NORMAL",
    expirationDate: "2027-02-15",
    lastUpdated: "10 mins ago"
  },
  {
    id: "RES-102",
    name: "Potable Water Containers (5 Gallons)",
    category: "FOOD_WATER",
    quantity: 600,
    availableQuantity: 110,
    reservedQuantity: 90,
    distributedQuantity: 400,
    unit: "gallons",
    location: "Central LGU Logistics Warehouse",
    lguName: "San Pablo City DRRM Operations Center",
    minThreshold: 200,
    stockStatus: "LOW_STOCK",
    lastUpdated: "5 mins ago"
  },
  {
    id: "RES-103",
    name: "Inflatable Water Rescue Boats (Motorized)",
    category: "RESCUE_GEAR",
    quantity: 8,
    availableQuantity: 2,
    reservedQuantity: 4,
    distributedQuantity: 2,
    unit: "units",
    location: "Rescue Equipment Depot B",
    lguName: "San Pablo City DRRM Operations Center",
    minThreshold: 3,
    stockStatus: "LOW_STOCK",
    lastUpdated: "Just now"
  },
  {
    id: "RES-104",
    name: "Emergency First Aid & Trauma Kits",
    category: "MEDICAL_SUPPLIES",
    quantity: 350,
    availableQuantity: 240,
    reservedQuantity: 50,
    distributedQuantity: 60,
    unit: "kits",
    location: "Health Command Center",
    lguName: "San Pablo City DRRM Operations Center",
    minThreshold: 80,
    stockStatus: "NORMAL",
    expirationDate: "2026-12-01",
    lastUpdated: "30 mins ago"
  },
  {
    id: "RES-105",
    name: "Industrial Portable Generators (5.5 kW)",
    category: "POWER_COMM",
    quantity: 15,
    availableQuantity: 3,
    reservedQuantity: 8,
    distributedQuantity: 4,
    unit: "units",
    location: "Central LGU Logistics Warehouse",
    lguName: "San Pablo City DRRM Operations Center",
    minThreshold: 5,
    stockStatus: "LOW_STOCK",
    lastUpdated: "1 hour ago"
  },
  {
    id: "RES-106",
    name: "Hygiene & Sanitation Family Kits",
    category: "HYGIENE_KITS",
    quantity: 900,
    availableQuantity: 650,
    reservedQuantity: 100,
    distributedQuantity: 150,
    unit: "kits",
    location: "Central LGU Logistics Warehouse",
    lguName: "San Pablo City DRRM Operations Center",
    minThreshold: 200,
    stockStatus: "NORMAL",
    lastUpdated: "40 mins ago"
  }
];

export const initialEvacuationCenters: EvacuationCenter[] = [
  {
    id: "EC-001",
    name: "Central Gymnasium Evacuation Facility",
    address: "Mabini Ave corner 5th St",
    barangay: "Barangay San Lucas 1",
    lguName: "San Pablo City DRRM Operations Center",
    lat: 14.0705, // Central San Pablo
    lng: 121.3230,
    capacity: 500,
    currentOccupants: 440,
    facilities: {
      powerGenerator: true,
      medicalStation: true,
      sanitation: true,
      wifiComm: true,
      communityKitchen: true,
      waterPurifier: true
    },
    status: "OPEN",
    contactPerson: "Kapt. Ricardo Dalisay",
    contactPhone: "+63 917 111 8899",
    updatedAt: "10 mins ago"
  },
  {
    id: "EC-002",
    name: "Barangay San Jose High School Evacuation Shelter",
    address: "School Road, Barangay San Jose",
    barangay: "Barangay San Jose",
    lguName: "San Pablo City DRRM Operations Center",
    lat: 14.0785, 
    lng: 121.3280,
    capacity: 350,
    currentOccupants: 190,
    facilities: {
      powerGenerator: true,
      medicalStation: true,
      sanitation: true,
      wifiComm: false,
      communityKitchen: true,
      waterPurifier: false
    },
    status: "OPEN",
    contactPerson: "Principal Leonora Castro",
    contactPhone: "+63 918 222 7766",
    updatedAt: "25 mins ago"
  },
  {
    id: "EC-003",
    name: "East Multi-Purpose Covered Court",
    address: "East Boulevard near Park",
    barangay: "Barangay San Diego",
    lguName: "San Pablo City DRRM Operations Center",
    lat: 14.0537, // Lake Bunot area
    lng: 121.3340,
    capacity: 300,
    currentOccupants: 300,
    facilities: {
      powerGenerator: false,
      medicalStation: false,
      sanitation: true,
      wifiComm: true,
      communityKitchen: false,
      waterPurifier: false
    },
    status: "FULL",
    contactPerson: "Kagawad Miguel Torres",
    contactPhone: "+63 919 333 6655",
    updatedAt: "5 mins ago"
  },
  {
    id: "EC-004",
    name: "Metro University Auditorium Shelter",
    address: "University Belt Campus B",
    barangay: "Barangay 1-A",
    lguName: "San Pablo City DRRM Operations Center",
    lat: 14.0810, 
    lng: 121.3200,
    capacity: 800,
    currentOccupants: 120,
    facilities: {
      powerGenerator: true,
      medicalStation: true,
      sanitation: true,
      wifiComm: true,
      communityKitchen: true,
      waterPurifier: true
    },
    status: "OPEN",
    contactPerson: "Dr. Patricia Perez",
    contactPhone: "+63 920 444 5544",
    updatedAt: "1 hour ago"
  }
];

export const initialResponders: Responder[] = [
  {
    id: "resp-001",
    name: "Alpha Swift Water Rescue Team",
    codeName: "RESCUE-ALPHA",
    roleType: "DISASTER_RESPONSE_TEAM",
    status: "EN_ROUTE",
    lguName: "Manila DRRM Command",
    currentAssignmentId: "INC-2026-089",
    currentAssignmentTitle: "Trapped Rooftop Residents - Flood Sector 4",
    locationName: "En route to Riverview Subdivision",
    lat: 14.0690, 
    lng: 121.3220,
    phone: "+63 919 555 0303",
    teamSize: 6,
    skills: ["Water Navigation", "Trauma Care", "Night Search & Rescue"],
    equipment: ["2 Motorized Inflatable Boats", "Life Vests", "Satellite Radios", "Rope Launchers"],
    lastPing: "Just now"
  },
  {
    id: "resp-002",
    name: "Bravo Heavy Search & Rescue Unit",
    codeName: "RESCUE-BRAVO",
    roleType: "FIRE_RESCUE",
    status: "AVAILABLE",
    lguName: "Manila Fire & DRRM Station 1",
    locationName: "Fire Station Central Base",
    lat: 14.0715,
    lng: 121.3245,
    phone: "+63 917 444 9988",
    teamSize: 8,
    skills: ["Structural Collapse Rescue", "Heavy Machinery Operation", "Power Line Hazard Clearance"],
    equipment: ["Hydraulic Cutters", "Concrete Saws", "Rescue Crane Truck"],
    lastPing: "2 mins ago"
  },
  {
    id: "resp-003",
    name: "Charlie Emergency Paramedic Unit",
    codeName: "MED-CHARLIE",
    roleType: "PARAMEDIC",
    status: "ON_SCENE",
    lguName: "City Health Emergency Response",
    currentAssignmentId: "INC-2026-091",
    currentAssignmentTitle: "Evacuation Center Medical Triage",
    locationName: "Central Gymnasium Evacuation Facility",
    lat: 14.0615,
    lng: 121.3198,
    phone: "+63 918 333 7711",
    teamSize: 4,
    skills: ["Advanced Life Support", "Triage Management", "Oxygen Administration"],
    equipment: ["Ambulance Unit 3", "Portable Defibrillators", "Trauma Kits", "Oxygen Tanks"],
    lastPing: "1 min ago"
  },
  {
    id: "resp-004",
    name: "Delta Volunteer Logistics Squad",
    codeName: "VOL-DELTA",
    roleType: "VOLUNTEER",
    status: "AVAILABLE",
    lguName: "Red Cross Chapter Youth Volunteers",
    locationName: "Central Warehouse Depot",
    lat: 14.0680,
    lng: 121.3200,
    phone: "+63 921 555 0505",
    teamSize: 12,
    skills: ["Food Distribution", "Crowd Control", "Inventory Tracking"],
    equipment: ["Cargo Truck", "Barcode Scanners", "Megaphones"],
    lastPing: "8 mins ago"
  }
];

export const initialLGUs: LGUOrganization[] = [
  {
    id: "lgu-101",
    name: "San Pablo City DRRM Operations Center",
    region: "National Capital Region (NCR)",
    cityMunicipality: "City of Manila",
    barangayCount: 897,
    registeredRespondersCount: 142,
    drrmHead: "Atty. Marcelo H. del Pilar",
    contactEmail: "drrm@manila.gov.ph",
    contactPhone: "+63 2 8527 5128",
    status: "ACTIVE"
  },
  {
    id: "lgu-102",
    name: "Laguna Provincial DRRM Command",
    region: "National Capital Region (NCR)",
    cityMunicipality: "Quezon City",
    barangayCount: 142,
    registeredRespondersCount: 310,
    drrmHead: "Engr. Graciano Lopez Jaena",
    contactEmail: "qc.drrmo@quezoncity.gov.ph",
    contactPhone: "+63 2 8928 4325",
    status: "ACTIVE"
  },
  {
    id: "lgu-103",
    name: "Seven Lakes Disaster Corps",
    region: "National Capital Region (NCR)",
    cityMunicipality: "Marikina City",
    barangayCount: 16,
    registeredRespondersCount: 180,
    drrmHead: "Kapt. Emilio Jacinto",
    contactEmail: "rescue161@marikina.gov.ph",
    contactPhone: "+63 2 8646 2436",
    status: "ACTIVE"
  }
];

export const initialLogs: SystemLog[] = [
  {
    id: "log-1001",
    timestamp: "2026-08-11T06:45:00Z",
    userId: "usr-003",
    userName: "Sgt. Mark Villareal",
    userRole: "RESPONDER",
    action: "DISPATCH_UPDATE",
    details: "Confirmed en route to Incident INC-2026-089 (Riverview Subd Flood). ETA 8 minutes.",
    ipAddress: "120.28.194.12",
    severity: "INFO"
  },
  {
    id: "log-1002",
    timestamp: "2026-08-11T06:35:00Z",
    userId: "usr-002",
    userName: "Kapt. Elena Santos",
    userRole: "ADMIN",
    action: "ACCEPTED_AI_RECOMMENDATION",
    details: "Accepted AI Recommendation #REC-001: Dispatched Rescue Alpha Team to Sector 4 Flood.",
    ipAddress: "110.54.210.88",
    severity: "CRITICAL"
  },
  {
    id: "log-1003",
    timestamp: "2026-08-11T06:15:00Z",
    userId: "usr-004",
    userName: "Ana Reyes",
    userRole: "CITIZEN",
    action: "SUBMITTED_REQUEST",
    details: "Submitted emergency rescue request REQ-8801 for 5 trapped household members.",
    ipAddress: "49.145.102.5",
    severity: "WARNING"
  },
  {
    id: "log-1004",
    timestamp: "2026-08-11T05:00:00Z",
    userId: "usr-001",
    userName: "Dr. Roberto Mendoza",
    userRole: "SUPER_ADMIN",
    action: "ROLE_PERMISSION_MODIFIED",
    details: "Updated permission matrix for role 'ADMIN' to enable immediate emergency override.",
    ipAddress: "202.90.134.1",
    severity: "SECURITY"
  }
];

export const initialRolePermissions: RolePermission[] = [
  {
    role: "SUPER_ADMIN",
    description: "Full system administration, global configuration, user role provisioning, audit trail access.",
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
      systemLogsView: true
    }
  },
  {
    role: "ADMIN",
    description: "LGU-DRRM Operational Controller with incident command, dispatch, inventory control, and AI decision support.",
    permissions: {
      incidentsCreate: true,
      incidentsVerify: true,
      incidentsAssign: true,
      incidentsDelete: false,
      requestsManage: true,
      resourcesAdd: true,
      resourcesTransfer: true,
      evacuationManage: true,
      usersManage: false,
      rolesManage: false,
      systemLogsView: true
    }
  },
  {
    role: "RESPONDER",
    description: "Field personnel and team leads with dispatch task execution, status updates, and field Requisitioning.",
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
      systemLogsView: false
    }
  },
  {
    role: "VOLUNTEER",
    description: "Assigned volunteer workers for shelter assistance, food pack distribution, and center registration.",
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
      systemLogsView: false
    }
  },
  {
    role: "CITIZEN",
    description: "Public user interface designed for fast reporting, assistance requests, shelter navigation, and alert tracking.",
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
      systemLogsView: false
    }
  }
];

export const initialAIRecommendations: AIRecommendation[] = [
  {
    id: "rec-001",
    title: "High Priority Boat Rescue: Sector 4 Flood",
    severity: "CRITICAL",
    reasoning: "18 residents reported trapped on rooftops in Barangay San Jose (Riverview Subd). Water level rising 0.25m/hr. Alpha Swift Water Rescue Team is 2.2 km away with 2 inflatable motorcraft.",
    recommendedAction: "Dispatch Alpha Swift Water Rescue Team immediately with 2 inflatable motorboats and 20 life vests to Barangay San Jose.",
    impactScore: 96,
    category: "DISPATCH",
    targetId: "INC-2026-089",
    status: "ACCEPTED"
  },
  {
    id: "rec-002",
    title: "Resource Transfer: Potable Water Replenishment",
    severity: "HIGH",
    reasoning: "Central Gym Evacuation Facility is at 88% capacity (440 occupants). Clean drinking water stock will run out in 3.5 hours based on consumption rate.",
    recommendedAction: "Reallocate 200 water containers (5 Gal) and 150 hygiene kits from Central Warehouse Depot to Central Gym Evacuation Center.",
    impactScore: 89,
    category: "RESOURCE_ALLOCATION",
    targetId: "EC-001",
    status: "PENDING"
  },
  {
    id: "rec-003",
    title: "Pre-Emptive Evacuation Order: Hillside Landslide Sector",
    reasoning: "Hillside Kilometer 14 has recorded 140mm rainfall in 6 hours with active ground soil displacement. 45 households in downhill zone at risk.",
    severity: "HIGH",
    recommendedAction: "Issue Targeted Barangay Broadcast Advisory & Mobilize Delta Volunteer Logistics Squad for guided pre-emptive evacuation to Metro University Auditorium.",
    impactScore: 92,
    category: "EVACUATION",
    targetId: "INC-2026-092",
    status: "PENDING"
  }
];

export const initialAlerts: EmergencyAlert[] = [
  {
    id: "alt-001",
    title: "Typhoon Signal No. 3: Severe Rainfall & Storm Surge Advisory",
    affectedArea: "San Pablo City, Laguna Lakes, Mount Makiling Watershed",
    severity: "CRITICAL",
    instructions: "Residents in low-lying flood-prone areas are urged to execute pre-emptive evacuation immediately to designated evacuation centers. Avoid wading in floodwaters.",
    issuedAt: "2026-08-11T05:00:00Z",
    issuedBy: "PAGASA / LGU-DRRM Command",
    active: true
  },
  {
    id: "alt-002",
    title: "Road Blockage Advisory: Public Market Ave",
    affectedArea: "Barangay 1-A Market Precinct",
    severity: "WARNING",
    instructions: "Main market avenue closed due to collapsed structure wall and power cable hazard. Emergency response teams on site.",
    issuedAt: "2026-08-11T06:15:00Z",
    issuedBy: "LGU Traffic & Emergency Command",
    active: true
  }
];
