import { getLatestRates, LatestRate } from "./rates-repository";

export interface GraphEdge {
  to: string;
  weight: number;       // -Math.log(rate) for maximizing rate
  rate: number;
  providerId: number;
  providerName: string;
  feePercentage: number;
}

export interface RouteStep {
  from: string;
  to: string;
  rate: number;
  providerId: number;
  providerName: string;
  feePercentage: number;
}

export interface RoutePath {
  steps: RouteStep[];
  totalRate: number;        // product of all step rates
  totalWeight: number;      // sum of edge weights (for comparison)
  pathString: string;       // e.g. "BTC → ETH → SOL"
}

export interface MultiPathResult {
  fromAsset: string;
  toAsset: string;
  inputAmount: number;
  paths: RoutePath[];       // up to 3 best paths, sorted by totalRate descending
  bestPath: RoutePath;
  bestOutputAmount: number;
  timestamp: string;
}

function buildGraph(rates: LatestRate[]): Map<string, GraphEdge[]> {
  const graph = new Map<string, GraphEdge[]>();
  
  for (const rate of rates) {
    const rateValue = parseFloat(rate.rate);
    if (isNaN(rateValue) || rateValue <= 0) continue;
    
    // Add directed edge from from_asset to to_asset
    if (!graph.has(rate.from_asset)) {
      graph.set(rate.from_asset, []);
    }
    
    const edge: GraphEdge = {
      to: rate.to_asset,
      weight: -Math.log(rateValue),
      rate: rateValue,
      providerId: rate.provider_id,
      providerName: rate.provider_name,
      feePercentage: rate.fee_percentage
    };
    
    graph.get(rate.from_asset)!.push(edge);
  }
  
  return graph;
}

function dijkstraShortestPath(
  graph: Map<string, GraphEdge[]>, 
  from: string, 
  to: string,
  bannedNodes: Set<string> = new Set(),
  bannedEdges: Set<string> = new Set()
): { path: string[], totalWeight: number, totalRate: number } | null {
  if (from === to) {
    return { path: [from], totalWeight: 0, totalRate: 1 };
  }
  
  if (!graph.has(from) || !graph.has(to)) {
    return null;
  }
  
  const distances = new Map<string, number>();
  const previous = new Map<string, { node: string, edge: GraphEdge }>();
  const unvisited = new Set<string>();
  
  // Initialize
  for (const node of Array.from(graph.keys())) {
    distances.set(node, node === from ? 0 : Infinity);
    if (!bannedNodes.has(node)) {
      unvisited.add(node);
    }
  }
  
  let iterations = 0;
  while (unvisited.size > 0 && iterations < 100) { // Prevent infinite loops
    iterations++;
    
    // Find unvisited node with minimum distance
    let current: string | null = null;
    let minDistance = Infinity;
    
    for (const [node, distance] of Array.from(distances.entries())) {
      if (unvisited.has(node) && distance < minDistance) {
        minDistance = distance;
        current = node;
      }
    }
    
    if (current === null || minDistance === Infinity) {
      break;
    }
    
    if (current === to) {
      break; // Found destination
    }
    
    unvisited.delete(current);
    
    // Check neighbors
    const edges = graph.get(current) || [];
    for (const edge of edges) {
      if (!unvisited.has(edge.to)) continue;
      
      // Check if this edge is banned
      const edgeKey = `${current}-${edge.to}-${edge.providerId}`;
      if (bannedEdges.has(edgeKey)) continue;
      
      const altDistance = distances.get(current)! + edge.weight;
      const currentDistance = distances.get(edge.to) || Infinity;
      
      if (altDistance < currentDistance) {
        distances.set(edge.to, altDistance);
        previous.set(edge.to, { node: current, edge });
      }
    }
  }
  
  // Reconstruct path
  if (!previous.has(to) && from !== to) {
    return null;
  }
  
  const path: string[] = [];
  const steps: RouteStep[] = [];
  let current = to;
  let totalRate = 1;
  
  while (previous.has(current)) {
    const prev = previous.get(current)!;
    path.unshift(current);
    steps.unshift({
      from: prev.node,
      to: current,
      rate: prev.edge.rate,
      providerId: prev.edge.providerId,
      providerName: prev.edge.providerName,
      feePercentage: prev.edge.feePercentage
    });
    totalRate *= prev.edge.rate;
    current = prev.node;
  }
  
  path.unshift(from);
  
  if (path.length > 6) { // Max 5 hops (6 nodes)
    return null;
  }
  
  const totalWeight = distances.get(to) || 0;
  
  return {
    path,
    totalWeight,
    totalRate
  };
}

function dijkstraMultiPath(
  graph: Map<string, GraphEdge[]>, 
  from: string, 
  to: string, 
  maxPaths: number = 3
): RoutePath[] {
  if (from === to) {
    return [];
  }
  
  const paths: RoutePath[] = [];
  const bannedNodes = new Set<string>();
  const bannedEdges = new Set<string>();
  
  // Yen's K-Shortest Paths algorithm
  for (let k = 0; k < maxPaths; k++) {
    const result = dijkstraShortestPath(graph, from, to, bannedNodes, bannedEdges);
    
    if (!result) {
      break; // No more paths found
    }
    
    // Convert to RoutePath
    const steps: RouteStep[] = [];
    let totalRate = 1;
    
    for (let i = 0; i < result.path.length - 1; i++) {
      const fromNode = result.path[i];
      const toNode = result.path[i + 1];
      
      // Find the edge used
      const edges = graph.get(fromNode) || [];
      const edge = edges.find(e => e.to === toNode);
      
      if (edge) {
        steps.push({
          from: fromNode,
          to: toNode,
          rate: edge.rate,
          providerId: edge.providerId,
          providerName: edge.providerName,
          feePercentage: edge.feePercentage
        });
        totalRate *= edge.rate;
      }
    }
    
    const routePath: RoutePath = {
      steps,
      totalRate,
      totalWeight: result.totalWeight,
      pathString: result.path.join(' → ')
    };
    
    paths.push(routePath);
    
    // Ban intermediate nodes for next iteration to ensure different paths
    for (let i = 1; i < result.path.length - 1; i++) {
      bannedNodes.add(result.path[i]);
    }
    
    // Also ban the exact edges used in this path
    for (const step of steps) {
      const edgeKey = `${step.from}-${step.to}-${step.providerId}`;
      bannedEdges.add(edgeKey);
    }
  }
  
  // Sort by totalRate descending (best rate first)
  paths.sort((a, b) => b.totalRate - a.totalRate);
  
  return paths;
}

export async function findBestRoutes(
  fromAsset: string, 
  toAsset: string, 
  amount: number
): Promise<MultiPathResult> {
  const rates = await getLatestRates();
  const graph = buildGraph(rates);
  const paths = dijkstraMultiPath(graph, fromAsset, toAsset, 3);
  
  if (paths.length === 0) {
    throw new Error(`No route found between ${fromAsset} and ${toAsset}`);
  }
  
  const bestPath = paths[0];
  const bestOutputAmount = amount * bestPath.totalRate;
  
  return {
    fromAsset,
    toAsset,
    inputAmount: amount,
    paths,
    bestPath,
    bestOutputAmount,
    timestamp: new Date().toISOString()
  };
}

export { buildGraph, dijkstraMultiPath };
