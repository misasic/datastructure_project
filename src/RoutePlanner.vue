<template>
  <div class="route-planner">
    <div class="control-panel">
      <el-form :model="form" label-width="120px">
        <el-form-item label="当前位置">
          <el-select v-model="form.currentLocation" placeholder="请选择当前位置">
            <el-option
              v-for="location in locations"
              :key="location.id"
              :label="location.name"
              :value="location.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="目标地点">
          <div v-if="!form.isMultiPoint">
            <el-select v-model="form.destination" placeholder="请选择目标地点">
              <el-option
                v-for="location in locations"
                :key="location.id"
                :label="location.name"
                :value="location.id"
              />
            </el-select>
          </div>
          <div v-else>
            <el-select
              v-model="form.destinations"
              multiple
              placeholder="请选择多个目标地点"
            >
              <el-option
                v-for="location in locations"
                :key="location.id"
                :label="location.name"
                :value="location.id"
              />
            </el-select>
          </div>
        </el-form-item>

        <el-form-item label="路线规划策略">
          <el-radio-group v-model="form.strategy">
            <el-radio label="distance">最短距离</el-radio>
            <el-radio label="time">最短时间</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="交通方式">
          <el-select v-model="form.transportMode" placeholder="请选择交通方式">
            <el-option label="步行" value="walking" />
            <el-option
              v-if="isInSchool"
              label="自行车"
              value="bicycle"
            />
            <el-option
              v-if="!isInSchool"
              label="电瓶车"
              value="cart"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-switch
            v-model="form.isMultiPoint"
            active-text="多点路径"
            inactive-text="单点路径"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="planRoute">规划路线</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="map-container">
      <div ref="mapContainer" class="map"></div>
      <div v-if="route" class="route-info">
        <h3>路线信息</h3>
        <p>总距离: {{ route.distance.toFixed(2) }} 米</p>
        <p v-if="form.strategy === 'time'">
          预计时间: {{ (route.time || 0).toFixed(2) }} 分钟
        </p>
        <div class="route-steps">
          <div v-for="(step, index) in routeSteps" :key="index" class="step">
            {{ index + 1 }}. {{ step }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive, computed } from 'vue';
import PathFinder from '../utils/PathFinder';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default {
  name: 'RoutePlanner',
  props: {
    isInSchool: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const mapContainer = ref(null);
    const map = ref(null);
    const pathFinder = new PathFinder();
    const route = ref(null);
    const routeLayer = ref(null);

    const form = reactive({
      currentLocation: '',
      destination: '',
      destinations: [],
      strategy: 'distance',
      transportMode: 'walking',
      isMultiPoint: false
    });

    const locations = ref([]);
    
    // 初始化地图
    const initMap = () => {
      if (map.value) return;
      
      map.value = L.map(mapContainer.value).setView([39.966, 116.362], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map.value);
    };

    // 加载位置数据
    const loadLocations = async () => {
      try {
        const response = await fetch('/api/locations');
        locations.value = await response.json();
        
        // 将位置点添加到地图上
        locations.value.forEach(location => {
          L.marker([location.lat, location.lng])
            .bindPopup(location.name)
            .addTo(map.value);
        });
      } catch (error) {
        console.error('加载位置数据失败:', error);
      }
    };

    // 规划路线
    const planRoute = async () => {
      if (!form.currentLocation || (!form.destination && !form.destinations.length)) {
        alert('请选择起点和终点');
        return;
      }

      try {
        let result;
        if (form.isMultiPoint) {
          result = pathFinder.findMultiPointPath(
            form.currentLocation,
            form.destinations,
            form.strategy,
            form.transportMode
          );
        } else {
          result = pathFinder.findShortestPath(
            form.currentLocation,
            form.destination,
            form.strategy,
            form.transportMode
          );
        }

        route.value = result;
        drawRoute(result.path);
      } catch (error) {
        console.error('路线规划失败:', error);
        alert('路线规划失败，请重试');
      }
    };

    // 在地图上绘制路线
    const drawRoute = (path) => {
      if (routeLayer.value) {
        map.value.removeLayer(routeLayer.value);
      }

      const points = path.map(pointId => {
        const location = locations.value.find(loc => loc.id === pointId);
        return [location.lat, location.lng];
      });

      routeLayer.value = L.polyline(points, {
        color: 'blue',
        weight: 3,
        opacity: 0.7
      }).addTo(map.value);

      map.value.fitBounds(routeLayer.value.getBounds());
    };

    // 重置表单
    const resetForm = () => {
      Object.assign(form, {
        currentLocation: '',
        destination: '',
        destinations: [],
        strategy: 'distance',
        transportMode: 'walking',
        isMultiPoint: false
      });

      if (routeLayer.value) {
        map.value.removeLayer(routeLayer.value);
      }
      route.value = null;
    };

    // 路线步骤说明
    const routeSteps = computed(() => {
      if (!route.value) return [];
      
      return route.value.path.map((pointId, index) => {
        const location = locations.value.find(loc => loc.id === pointId);
        if (index === 0) {
          return `从 ${location.name} 出发`;
        } else if (index === route.value.path.length - 1) {
          return `到达 ${location.name}`;
        } else {
          return `经过 ${location.name}`;
        }
      });
    });

    onMounted(() => {
      initMap();
      loadLocations();
    });

    return {
      mapContainer,
      form,
      locations,
      route,
      routeSteps,
      planRoute,
      resetForm
    };
  }
};
</script>

<style scoped>
.route-planner {
  display: flex;
  height: 100%;
  padding: 20px;
}

.control-panel {
  width: 300px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-right: 20px;
}

.map-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.map {
  height: 70%;
  border-radius: 4px;
  overflow: hidden;
}

.route-info {
  margin-top: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
  max-height: 30%;
  overflow-y: auto;
}

.route-steps {
  margin-top: 10px;
}

.step {
  margin: 5px 0;
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}
</style> 