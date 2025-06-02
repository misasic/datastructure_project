class PathFinder {
  constructor() {
    this.graph = new Map(); // 存储图的邻接表
    this.transportModes = new Map(); // 存储每条边的可用交通方式
    this.congestionRates = new Map(); // 存储每条边的拥挤度
    this.idealSpeeds = new Map(); // 存储每条边的理想速度
  }

  // 添加边
  addEdge(from, to, distance, transportModes = ['walking'], congestionRate = 1.0, idealSpeed = 5) {
    if (!this.graph.has(from)) {
      this.graph.set(from, new Map());
    }
    if (!this.graph.has(to)) {
      this.graph.set(to, new Map());
    }

    // 存储边的信息
    this.graph.get(from).set(to, distance);
    this.graph.get(to).set(from, distance); // 假设是无向图
    
    const edgeKey = `${from}-${to}`;
    const reverseEdgeKey = `${to}-${from}`;
    
    this.transportModes.set(edgeKey, transportModes);
    this.transportModes.set(reverseEdgeKey, transportModes);
    
    this.congestionRates.set(edgeKey, congestionRate);
    this.congestionRates.set(reverseEdgeKey, congestionRate);
    
    this.idealSpeeds.set(edgeKey, idealSpeed);
    this.idealSpeeds.set(reverseEdgeKey, idealSpeed);
  }

  // 计算最短路径（Dijkstra算法）
  findShortestPath(start, end, strategy = 'distance', transportMode = 'walking') {
    const distances = new Map();
    const previous = new Map();
    const unvisited = new Set();

    // 初始化
    for (const vertex of this.graph.keys()) {
      distances.set(vertex, Infinity);
      unvisited.add(vertex);
    }
    distances.set(start, 0);

    while (unvisited.size > 0) {
      // 找到距离最小的未访问顶点
      let current = null;
      let minDistance = Infinity;
      for (const vertex of unvisited) {
        if (distances.get(vertex) < minDistance) {
          minDistance = distances.get(vertex);
          current = vertex;
        }
      }

      if (current === null) break;
      if (current === end) break;

      unvisited.delete(current);

      // 更新邻居的距离
      for (const [neighbor, distance] of this.graph.get(current)) {
        const edgeKey = `${current}-${neighbor}`;
        
        // 检查交通方式是否可用
        if (!this.transportModes.get(edgeKey).includes(transportMode)) {
          continue;
        }

        let weight = distance;
        if (strategy === 'time') {
          const congestionRate = this.congestionRates.get(edgeKey);
          const idealSpeed = this.idealSpeeds.get(edgeKey);
          const realSpeed = idealSpeed * congestionRate;
          weight = distance / realSpeed; // 时间 = 距离/速度
        }

        const totalDistance = distances.get(current) + weight;
        if (totalDistance < distances.get(neighbor)) {
          distances.set(neighbor, totalDistance);
          previous.set(neighbor, current);
        }
      }
    }

    // 构建路径
    const path = [];
    let current = end;
    while (current !== undefined) {
      path.unshift(current);
      current = previous.get(current);
    }

    return {
      path,
      distance: distances.get(end)
    };
  }

  // 计算途经多点的最短路径（改进的TSP算法）
  findMultiPointPath(start, points, strategy = 'distance', transportMode = 'walking') {
    const allPoints = [start, ...points];
    const n = allPoints.length;
    const distances = Array(n).fill().map(() => Array(n).fill(Infinity));
    const paths = Array(n).fill().map(() => Array(n).fill(null));

    // 计算所有点对之间的最短路径
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          const result = this.findShortestPath(allPoints[i], allPoints[j], strategy, transportMode);
          distances[i][j] = result.distance;
          paths[i][j] = result.path;
        }
      }
    }

    // 使用动态规划求解TSP
    const dp = Array(1 << n).fill().map(() => Array(n).fill(Infinity));
    const parent = Array(1 << n).fill().map(() => Array(n).fill(-1));
    dp[1][0] = 0; // 起点状态

    for (let mask = 1; mask < (1 << n); mask++) {
      for (let u = 0; u < n; u++) {
        if ((mask & (1 << u)) === 0) continue;
        for (let v = 0; v < n; v++) {
          if ((mask & (1 << v)) !== 0) continue;
          const newMask = mask | (1 << v);
          if (dp[mask][u] + distances[u][v] < dp[newMask][v]) {
            dp[newMask][v] = dp[mask][u] + distances[u][v];
            parent[newMask][v] = u;
          }
        }
      }
    }

    // 构建最终路径
    const finalPath = [];
    let mask = (1 << n) - 1;
    let current = 0;
    while (mask !== 0) {
      finalPath.unshift(allPoints[current]);
      const prev = parent[mask][current];
      if (prev === -1) break;
      mask ^= (1 << current);
      current = prev;
    }
    finalPath.push(start); // 返回起点

    return {
      path: finalPath,
      distance: dp[(1 << n) - 1][0]
    };
  }
}

export default PathFinder; 