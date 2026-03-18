export interface RouteNode {
  name: string;
  edges: { to: string; distance: number; time: number }[];
}

// Dummy graph of major cities in India to simulate route optimization
const INDIA_ROAD_GRAPH: Record<string, RouteNode> = {
  'Mumbai': { name: 'Mumbai', edges: [{ to: 'Pune', distance: 150, time: 3 }, { to: 'Surat', distance: 280, time: 5 }] },
  'Pune': { name: 'Pune', edges: [{ to: 'Mumbai', distance: 150, time: 3 }, { to: 'Bangalore', distance: 840, time: 14 }] },
  'Surat': { name: 'Surat', edges: [{ to: 'Mumbai', distance: 280, time: 5 }, { to: 'Ahmedabad', distance: 260, time: 4 }] },
  'Ahmedabad': { name: 'Ahmedabad', edges: [{ to: 'Surat', distance: 260, time: 4 }, { to: 'Delhi', distance: 940, time: 16 }] },
  'Delhi': { name: 'Delhi', edges: [{ to: 'Ahmedabad', distance: 940, time: 16 }, { to: 'Jaipur', distance: 280, time: 5 }] },
  'Jaipur': { name: 'Jaipur', edges: [{ to: 'Delhi', distance: 280, time: 5 }, { to: 'Ahmedabad', distance: 660, time: 11 }] },
  'Bangalore': { name: 'Bangalore', edges: [{ to: 'Pune', distance: 840, time: 14 }, { to: 'Chennai', distance: 350, time: 6 }] },
  'Chennai': { name: 'Chennai', edges: [{ to: 'Bangalore', distance: 350, time: 6 }] },
};

export class RouteOptimizationService {
  /**
   * Run Dijkstra's Algorithm to find shortest or fastest route
   */
  static optimizeRoute(start: string, end: string, optimizeBy: 'distance' | 'time' = 'distance') {
    if (!INDIA_ROAD_GRAPH[start] || !INDIA_ROAD_GRAPH[end]) {
      throw new Error("Start or end location not in our network graph.");
    }

    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const unvisited = new Set<string>();

    for (const node of Object.keys(INDIA_ROAD_GRAPH)) {
      distances[node] = Infinity;
      previous[node] = null;
      unvisited.add(node);
    }
    distances[start] = 0;

    while (unvisited.size > 0) {
      let currNode: string | null = null;
      let minVal = Infinity;

      for (const node of unvisited) {
        if (distances[node] < minVal) {
          currNode = node;
          minVal = distances[node];
        }
      }

      if (currNode === null) break;
      if (currNode === end) break; 

      unvisited.delete(currNode);

      const neighbors = INDIA_ROAD_GRAPH[currNode].edges;
      for (const edge of neighbors) {
        if (!unvisited.has(edge.to)) continue;

        const weight = optimizeBy === 'distance' ? edge.distance : edge.time;
        const altRoute = distances[currNode] + weight;

        if (altRoute < distances[edge.to]) {
          distances[edge.to] = altRoute;
          previous[edge.to] = currNode;
        }
      }
    }

    // path reconstruction
    const path: string[] = [];
    let u: string | null = end;
    while (u) {
      path.unshift(u);
      u = previous[u];
    }

    if (path.length === 1 && path[0] !== start) {
      throw new Error("No route found.");
    }

    return {
      path,
      totalMetric: distances[end],
      metricUsed: optimizeBy
    };
  }
}