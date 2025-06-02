import express from 'express';
import DatabaseService from './DatabaseService';
import PathFinder from '../utils/PathFinder';

const router = express.Router();
const pathFinder = new PathFinder();

// 初始化路径规划器
async function initializePathFinder() {
  try {
    // 获取所有位置点
    const locations = await DatabaseService.getLocations();
    
    // 获取所有路径
    for (const location of locations) {
      for (const otherLocation of locations) {
        if (location.id !== otherLocation.id) {
          const paths = await DatabaseService.getPath(location.id, otherLocation.id);
          
          for (const path of paths) {
            const transportModes = await DatabaseService.getPathTransportModes(path.id);
            pathFinder.addEdge(
              path.from_location_id,
              path.to_location_id,
              path.distance,
              transportModes.map(mode => mode.name),
              path.congestion_rate,
              path.ideal_speed
            );
          }
        }
      }
    }
  } catch (error) {
    console.error('初始化路径规划器失败:', error);
  }
}

// 获取所有位置点
router.get('/locations', async (req, res) => {
  try {
    const locations = await DatabaseService.getLocations();
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: '获取位置点失败' });
  }
});

// 获取最短路径
router.post('/route', async (req, res) => {
  try {
    const { from, to, strategy, transportMode } = req.body;
    
    if (!from || !to) {
      return res.status(400).json({ error: '起点和终点不能为空' });
    }

    const result = pathFinder.findShortestPath(from, to, strategy, transportMode);
    
    // 获取路径上每个点的详细信息
    const pathDetails = await Promise.all(
      result.path.map(locationId => DatabaseService.getLocationDetails(locationId))
    );

    res.json({
      ...result,
      pathDetails
    });
  } catch (error) {
    res.status(500).json({ error: '路径规划失败' });
  }
});

// 获取多点路径
router.post('/multi-route', async (req, res) => {
  try {
    const { start, points, strategy, transportMode } = req.body;
    
    if (!start || !points || !points.length) {
      return res.status(400).json({ error: '起点和途经点不能为空' });
    }

    const result = pathFinder.findMultiPointPath(start, points, strategy, transportMode);
    
    // 获取路径上每个点的详细信息
    const pathDetails = await Promise.all(
      result.path.map(locationId => DatabaseService.getLocationDetails(locationId))
    );

    res.json({
      ...result,
      pathDetails
    });
  } catch (error) {
    res.status(500).json({ error: '多点路径规划失败' });
  }
});

// 获取交通方式
router.get('/transport-modes', async (req, res) => {
  try {
    const modes = await DatabaseService.getTransportModes();
    res.json(modes);
  } catch (error) {
    res.status(500).json({ error: '获取交通方式失败' });
  }
});

// 获取路径拥挤度
router.get('/path-congestion/:pathId', async (req, res) => {
  try {
    const congestion = await DatabaseService.getPathCongestion(req.params.pathId);
    res.json({ congestion });
  } catch (error) {
    res.status(500).json({ error: '获取路径拥挤度失败' });
  }
});

// 更新路径拥挤度
router.put('/path-congestion/:pathId', async (req, res) => {
  try {
    const { congestionRate } = req.body;
    await DatabaseService.updatePathCongestion(req.params.pathId, congestionRate);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '更新路径拥挤度失败' });
  }
});

// 初始化路径规划器
initializePathFinder();

export default router; 