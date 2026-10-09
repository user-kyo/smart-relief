import { calculateNewResourceStock, generateFallbackRecommendations } from './logic';
import { ResourceItem, Incident } from '../types';

const generateMockResources = (count: number): ResourceItem[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `res-${i}`,
    name: `Resource ${i}`,
    category: 'FOOD',
    quantity: 1000,
    unit: 'Boxes',
    availableQuantity: 50,
    distributedQuantity: 0,
    minThreshold: 100,
    stockStatus: 'LOW_STOCK',
    location: 'Warehouse',
    lastUpdated: new Date().toISOString(),
    supplier: 'Supplier',
    expiryDate: '2026-12-31'
  } as any));
};

const generateMockIncidents = (count: number): Incident[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `inc-${i}`,
    title: `Incident ${i}`,
    severity: i % 2 === 0 ? 'CRITICAL' : 'HIGH',
    status: 'ACTIVE',
    locationName: `Location ${i}`,
    affectedCount: 100
  })) as unknown as Incident[];
};

const runBenchmark = () => {
  console.log("=== Performance Benchmarks ===");
  const recordCounts = [100, 1000, 10000, 100000];

  for (const count of recordCounts) {
    const resources = generateMockResources(count);
    const incidents = generateMockIncidents(count);

    // Test: calculateNewResourceStock for all resources (Map equivalent)
    const startStock = performance.now();
    for (let i = 0; i < resources.length; i++) {
      calculateNewResourceStock(resources[i], -10);
    }
    const endStock = performance.now();
    
    // Test: generateFallbackRecommendations
    const startAI = performance.now();
    generateFallbackRecommendations(incidents, resources);
    const endAI = performance.now();

    console.log(`Records: ${count}`);
    console.log(` - updateResourceStock: ${(endStock - startStock).toFixed(2)} ms`);
    console.log(` - generateFallbackRecommendations: ${(endAI - startAI).toFixed(2)} ms`);
  }
};

runBenchmark();
