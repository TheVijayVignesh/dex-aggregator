import { findOptimalRoute } from '../lib/services/pathfinding';

async function debugPathfinding() {
  console.log('🔍 Debugging pathfinding algorithm...');
  
  try {
    const result = await findOptimalRoute('USD', 'EUR', 1000);
    
    console.log('✅ Pathfinding successful!');
    console.log('📋 Result:', {
      optimalPath: result.optimalPath,
      finalRate: result.finalRate,
      estimatedAmount: result.estimatedAmount,
      steps: result.steps,
      totalWeight: result.totalWeight,
    });
    
  } catch (error) {
    console.error('❌ Pathfinding failed:', error);
  }
}

debugPathfinding().catch(console.error);
