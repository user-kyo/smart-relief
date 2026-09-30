export type UserRole = "SUPER_ADMIN" | "ADMIN" | "VOLUNTEER" | "CITIZEN";

export type IncidentSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type IncidentStatus = "REPORTED" | "VERIFIED" | "ASSIGNED" | "RESPONDING" | "RESOLVED" | "CLOSED";
export type IncidentType = "FLOOD" | "LANDSLIDE" | "FIRE" | "TYPHOON" | "EARTHQUAKE" | "MEDICAL" | "STRUCTURE_COLLAPSE" | "OTHER";

export type RequestStatus = "SUBMITTED" | "VERIFIED" | "ASSIGNED" | "RESPONDING" | "RESOLVED" | "REJECTED";
export type RequestType = "RESCUE" | "MEDICAL" | "FOOD_WATER" | "SHELTER" | "TRANSPORT" | "EVACUATION_HELP";

export type ResourceCategory = "FOOD_WATER" | "MEDICAL_SUPPLIES" | "RESCUE_GEAR" | "POWER_COMM" | "HYGIENE_KITS" | "CLOTHING_BEDDING";
export type StockStatus = "NORMAL" | "LOW_STOCK" | "DEPLETED" | "CRITICAL";

export type ResponderStatus = "AVAILABLE" | "EN_ROUTE" | "ON_SCENE" | "BUSY" | "OFFLINE";

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  lguId?: string;
  lguName?: string;
  barangay?: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  skills?: string[];
  lastActive: string;
  avatarUrl?: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  locationName: string;
  barangay: string;
  lguName: string;
  lat: number;
  lng: number;
  affectedCount: number;
  reportedBy: string;
  reportedByPhone?: string;
  reportedAt: string;
  updatedAt: string;
  assignedResponderIds: string[];
  assignedResponderNames?: string[];
  relatedRequestIds?: string[];
  photoUrl?: string;
  timeline: {
    timestamp: string;
    action: string;
    performedBy: string;
    notes?: string;
  }[];
}

export interface AssistanceRequest {
  id: string;
  citizenName: string;
  citizenPhone: string;
  requestType: RequestType;
  severity: IncidentSeverity;
  locationName: string;
  barangay: string;
  lat: number;
  lng: number;
  peopleCount: number;
  specialNeeds?: string; // e.g. "2 elderly, 1 infant"
  description: string;
  status: RequestStatus;
  submittedAt: string;
  updatedAt: string;
  assignedResponderId?: string;
  assignedResponderName?: string;
  photoUrl?: string;
  incidentId?: string;
  statusHistory: {
    status: RequestStatus;
    timestamp: string;
    note?: string;
  }[];
}

export interface ResourceItem {
  id: string;
  name: string;
  category: ResourceCategory;
  quantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  distributedQuantity: number;
  unit: string; // e.g., "boxes", "kits", "units", "liters", "packs"
  location: string;
  lguName: string;
  minThreshold: number; // triggers low stock alert
  stockStatus: StockStatus;
  expirationDate?: string;
  lastUpdated: string;
}

export interface EvacuationCenter {
  id: string;
  name: string;
  address: string;
  barangay: string;
  lguName: string;
  lat: number;
  lng: number;
  capacity: number;
  currentOccupants: number;
  facilities: {
    powerGenerator: boolean;
    medicalStation: boolean;
    sanitation: boolean;
    wifiComm: boolean;
    communityKitchen: boolean;
    waterPurifier: boolean;
  };
  status: "OPEN" | "FULL" | "STANDBY" | "CLOSED";
  contactPerson: string;
  contactPhone: string;
  updatedAt: string;
}

export interface Responder {
  id: string;
  name: string;
  codeName: string;
  roleType: "DISASTER_RESPONSE_TEAM" | "PARAMEDIC" | "FIRE_RESCUE" | "VOLUNTEER" | "POLICE_ENFORCEMENT";
  status: ResponderStatus;
  lguName: string;
  currentAssignmentId?: string;
  currentAssignmentTitle?: string;
  locationName: string;
  lat: number;
  lng: number;
  phone: string;
  teamSize: number;
  skills: string[];
  equipment: string[];
  lastPing: string;
}

export interface LGUOrganization {
  id: string;
  name: string;
  region: string;
  cityMunicipality: string;
  barangayCount: number;
  registeredRespondersCount: number;
  drrmHead: string;
  contactEmail: string;
  contactPhone: string;
  status: "ACTIVE" | "PENDING_APPROVAL" | "SUSPENDED";
}

export interface SystemLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  ipAddress: string;
  severity: "INFO" | "WARNING" | "CRITICAL" | "SECURITY";
}

export interface RolePermission {
  role: UserRole;
  description: string;
  permissions: {
    incidentsCreate: boolean;
    incidentsVerify: boolean;
    incidentsAssign: boolean;
    incidentsDelete: boolean;
    requestsManage: boolean;
    resourcesAdd: boolean;
    resourcesTransfer: boolean;
    evacuationManage: boolean;
    usersManage: boolean;
    rolesManage: boolean;
    systemLogsView: boolean;
  };
}

export interface AIRecommendation {
  id: string;
  title: string;
  severity: IncidentSeverity;
  reasoning: string;
  recommendedAction: string;
  impactScore: number;
  category: "DISPATCH" | "RESOURCE_ALLOCATION" | "EVACUATION" | "ALERT";
  targetId?: string;
  status?: "PENDING" | "ACCEPTED" | "REJECTED" | "MODIFIED";
}

export interface EmergencyAlert {
  id: string;
  title: string;
  affectedArea: string;
  severity: "CRITICAL" | "WARNING" | "ADVISORY";
  instructions: string;
  issuedAt: string;
  issuedBy: string;
  active: boolean;
}
