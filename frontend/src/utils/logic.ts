import { AIRecommendation, EvacuationCenter, Incident, ResourceItem, StockStatus } from "../types";

export const calculateNewResourceStock = (res: ResourceItem, deltaAvailable: number): ResourceItem => {
  const newAvail = Math.max(0, res.availableQuantity + deltaAvailable);
  let stockStatus: StockStatus = "NORMAL";
  if (newAvail === 0) stockStatus = "DEPLETED";
  else if (newAvail < res.minThreshold) stockStatus = "LOW_STOCK";

  return {
    ...res,
    availableQuantity: newAvail,
    distributedQuantity: res.distributedQuantity + (deltaAvailable < 0 ? Math.abs(deltaAvailable) : 0),
    stockStatus,
    lastUpdated: "Just now"
  };
};

export const calculateNewEvacuationOccupancy = (ec: EvacuationCenter, occupants: number): EvacuationCenter => {
  const clampedOccupants = Math.max(0, occupants);
  const status = clampedOccupants >= ec.capacity ? "FULL" : "OPEN";
  return { ...ec, currentOccupants: clampedOccupants, status };
};

export const acceptAIRecommendationLogic = (recs: AIRecommendation[], recId: string): AIRecommendation[] => {
  return recs.map(r => r.id === recId ? { ...r, status: "ACCEPTED" as const } : r);
};

export const rejectAIRecommendationLogic = (recs: AIRecommendation[], recId: string): AIRecommendation[] => {
  return recs.map(r => r.id === recId ? { ...r, status: "REJECTED" as const } : r);
};

export const generateFallbackRecommendations = (incidents: Incident[], resources: ResourceItem[], timestamp: number = Date.now()): AIRecommendation[] => {
  const criticalIncidents = incidents.filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH');
  const lowResources = resources.filter(r => r.availableQuantity <= r.minThreshold);
  
  const fallbackRecs: AIRecommendation[] = [];
  
  if (criticalIncidents.length > 0) {
    const target = criticalIncidents[0];
    fallbackRecs.push({
      id: `rec-gen-mock-${timestamp}-1`,
      title: `Priority Response: ${target.title}`,
      severity: target.severity,
      reasoning: `Incident '${target.title}' reported at ${target.locationName} requires immediate attention due to its ${target.severity} severity status and potential civilian impact.`,
      recommendedAction: `Deploy nearest available response unit and medical team to ${target.locationName}.`,
      impactScore: target.severity === 'CRITICAL' ? 96 : 84,
      category: "DISPATCH",
      targetId: target.id,
      status: "PENDING"
    });
  }

  if (lowResources.length > 0) {
    const targetRes = lowResources[0];
    fallbackRecs.push({
      id: `rec-gen-mock-${timestamp}-2`,
      title: "Resource Depletion Alert",
      severity: "HIGH",
      reasoning: `Stock for ${targetRes.name} (${targetRes.category.replace(/_/g, ' ')}) is critically low (${targetRes.quantity} ${targetRes.unit}s remaining, which is below the safe threshold).`,
      recommendedAction: `Initiate emergency procurement or inter-facility transfer of at least ${targetRes.minThreshold * 2} ${targetRes.unit}s of ${targetRes.name}.`,
      impactScore: 89,
      category: "RESOURCE_ALLOCATION",
      targetId: targetRes.id,
      status: "PENDING"
    });
  }
  
  if (fallbackRecs.length === 0) {
    fallbackRecs.push({
      id: `rec-gen-mock-${timestamp}-3`,
      title: "Routine Area Monitoring",
      severity: "LOW",
      reasoning: "System analysis shows stable resource levels and no critical active incidents in the monitored sectors.",
      recommendedAction: "Maintain standard operational readiness and conduct routine perimeter checks on vulnerable hazard zones.",
      impactScore: 45,
      category: "EVACUATION",
      status: "PENDING"
    });
  }
  
  return fallbackRecs;
};
