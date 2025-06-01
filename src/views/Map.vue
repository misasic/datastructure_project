<template>
  <div class="map-container">
    <div class="header">
      <h1>BUPTGuider 地图导航</h1>
      <button @click="handleLogout" class="logout-btn"></button>
    </div>
    
    <div class="search-box">
      <div class="input-group">
        <label>出发点</label>
        <input
          v-model="startPoint"
          type="text"
          placeholder="输入出发点"
          @keyup.enter="planRoute"
        />
      </div>
      <div class="input-group">
        <label>目的地</label>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="输入目的地"
          @keyup.enter="planRoute"
        />
      </div>
      <button @click="planRoute" class="search-btn">路线规划</button>
    </div>
    
    <div id="map-container" style="width: 100%; height: 500px;"></div>
    
    <div v-if="loading" class="loading">加载中...</div>
    
    <div class="route-info" v-if="routeInfo">
      <h3>路线信息</h3>
      <p><strong>距离:</strong> {{ routeInfo.distance }}</p>
      <p><strong>预计时间:</strong> {{ routeInfo.duration }}</p>
      <div class="steps">
        <h4>路线指引</h4>
        <ol>
          <li v-for="(step, index) in routeInfo.steps" :key="index">{{ step }}</li>
        </ol>
      </div>
    </div>
    
    <button @click="goToRecommendation" class="nav-btn">旅游推荐</button>
  </div>
</template>

<script>
export default {
  name: 'AMap',
  data() {
    return {
      startPoint: '北京邮电大学',
      searchQuery: '',
      map: null,
      placeSearch: null,
      driving: null,
      routeInfo: null,
      loading: false,
      amapKey: '333e8dd6553e2cca8012b2cf295764ec',
      amapSecurityCode: '32e30863f6e4de71c09bdb1b6dbd66a5'
    };
  },
  mounted() {
    this.initMap();
  },
  methods: {
    initMap() {
      const script = document.createElement('script');
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${this.amapKey}&plugin=AMap.PlaceSearch,AMap.Driving,AMap.ControlBar&callback=initAMap`;
      
      window.initAMap = () => {
        this.map = new AMap.Map('map-container', {
          zoom: 15,
          center: [116.397428, 39.90923]
        });
        
        this.map.addControl(new AMap.ControlBar({
          showZoomBar: true,
          showControlButton: true,
          position: { right: '10px', top: '10px' }
        }));
        
        this.placeSearch = new AMap.PlaceSearch({
          pageSize: 10,
          pageIndex: 1,
          city: '北京',
          citylimit: false,
          type: '',
          extensions: 'all',
          map: this.map,
          securityConfig: {
            securityJsCode: this.amapSecurityCode
          }
        });
        
        this.driving = new AMap.Driving({
          map: this.map,
          policy: AMap.DrivingPolicy.LEAST_TIME,
          securityConfig: {
            securityJsCode: this.amapSecurityCode
          }
        });

        // 搜索北京邮电大学并定位
        this.placeSearch.search('北京邮电大学', (status, result) => {
          if (status === 'complete' && result.poiList.pois.length > 0) {
            const location = result.poiList.pois[0].location;
            this.map.setCenter([location.lng, location.lat]);
            this.map.setZoom(16);
            
            // 添加标记点
            new AMap.Marker({
              map: this.map,
              position: [location.lng, location.lat],
              title: '北京邮电大学'
            });
          }
        });
      };
      
      document.head.appendChild(script);
    },
    
    async planRoute() {
      if (!this.searchQuery || !this.startPoint) {
        alert('请输入出发点和目的地');
        return;
      }
      
      this.loading = true;
      this.routeInfo = null;
      
      try {
        const startResult = await this.getLocation(this.startPoint);
        if (!startResult) {
          this.loading = false;
          alert('无法找到出发点，请尝试输入更详细的地址，例如：北京市海淀区西土城路10号北京邮电大学');
          return;
        }

        const endResult = await this.getLocation(this.searchQuery);
        if (!endResult) {
          this.loading = false;
          alert('无法找到目的地，请尝试输入更详细的地址，例如：北京市海淀区西单北大街120号');
          return;
        }
        
        const start = [startResult.lng, startResult.lat];
        const end = [endResult.lng, endResult.lat];
        
        this.driving.search(start, end, (status, result) => {
          this.loading = false;
          if (status === 'complete') {
            const route = result.routes[0];
            this.routeInfo = {
              distance: (route.distance / 1000).toFixed(1) + '公里',
              duration: this.formatDuration(route.time),
              steps: route.steps.map(step => 
                step.instruction.replace(/<.*?>/g, '')
              )
            };
          } else {
            console.error('路线规划失败:', result);
            alert('路线规划失败，请检查输入的地点是否正确');
          }
        });
      } catch (error) {
        this.loading = false;
        console.error('路线规划失败:', error);
        alert('路线规划失败，请稍后重试');
      }
    },
    
    getLocation(query) {
      return new Promise((resolve) => {
        // 如果输入的是北京邮电大学，直接返回固定坐标
        if (query === '北京邮电大学') {
          resolve({
            lng: 116.358428,
            lat: 39.95923
          });
          return;
        }
        
        this.placeSearch.search(query, (status, result) => {
          if (status === 'complete' && result.poiList.pois.length > 0) {
            const location = result.poiList.pois[0].location;
            resolve({
              lng: location.lng,
              lat: location.lat
            });
          } else {
            resolve(null);
          }
        });
      });
    },
    
    formatDuration(seconds) {
      const mins = Math.floor(seconds / 60);
      if (mins < 60) return mins + '分钟';
      const hours = Math.floor(mins / 60);
      return hours + '小时' + (mins % 60 > 0 ? (mins % 60) + '分钟' : '');
    },
    
    handleLogout() {
      localStorage.removeItem('user');
      this.$router.push('/');
    },
    
    goToRecommendation() {
      this.$router.push('/recommendation');
    }
  }
};
</script>

<style scoped>
.map-container {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
}

.header:hover {
  transform: translateY(-2px);
}

.header h1 {
  color: #1a1a1a;
  margin: 0;
  font-size: 26px;
  font-weight: 600;
  background: linear-gradient(45deg, #409eff, #36cfc9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.logout-btn {
  padding: 12px 28px;
  background: linear-gradient(45deg, #f56c6c, #e74c3c);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 15px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(245, 108, 108, 0.2);
}

.logout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 108, 108, 0.3);
}

.logout-btn:active {
  transform: translateY(0);
}

.logout-btn::before {
  content: "退出";
  margin-right: 4px;
}

.logout-btn::after {
  content: "→";
  font-size: 18px;
  transition: transform 0.3s ease;
}

.logout-btn:hover::after {
  transform: translateX(5px);
}

.search-box {
  display: flex;
  gap: 25px;
  margin-bottom: 30px;
  padding: 25px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
}

.search-box:hover {
  transform: translateY(-2px);
}

.input-group {
  flex: 1;
  position: relative;
}

.input-group label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: #1a1a1a;
  font-size: 15px;
}

.search-box input {
  width: 100%;
  padding: 14px;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 15px;
  background-color: #fafafa;
}

.search-box input:focus {
  outline: none;
  border-color: #409eff;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

.search-btn {
  padding: 0 35px;
  background: linear-gradient(45deg, #409eff, #36cfc9);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 15px;
  font-weight: 500;
  height: 48px;
  align-self: flex-end;
  box-shadow: 0 4px 15px rgba(64, 158, 255, 0.2);
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.3);
}

.search-btn:active {
  transform: translateY(0);
}

#map-container {
  width: 100%;
  height: 600px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 30px;
  overflow: hidden;
}

.route-info {
  margin-top: 30px;
  padding: 25px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
}

.route-info:hover {
  transform: translateY(-2px);
}

.route-info h3 {
  color: #1a1a1a;
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 600;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f2f5;
}

.route-info p {
  margin: 12px 0;
  color: #666;
  font-size: 15px;
  display: flex;
  align-items: center;
}

.route-info strong {
  color: #1a1a1a;
  margin-right: 10px;
  font-weight: 600;
  min-width: 80px;
}

.steps {
  margin-top: 25px;
}

.steps h4 {
  color: #1a1a1a;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
}

.steps ol {
  padding-left: 20px;
  margin: 0;
}

.steps li {
  margin-bottom: 15px;
  line-height: 1.6;
  color: #666;
  font-size: 15px;
  padding: 12px 15px;
  background: #fafafa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.steps li:hover {
  background: #f0f2f5;
  transform: translateX(5px);
}

.loading {
  padding: 20px;
  text-align: center;
  color: #666;
  font-size: 15px;
  background: white;
  border-radius: 8px;
  margin: 20px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

.nav-btn {
  padding: 12px 28px;
  background: linear-gradient(45deg, #409eff, #36cfc9);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 15px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(64, 158, 255, 0.2);
  margin-top: 20px;
  margin-left: 20px;
}

.nav-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.3);
}

.nav-btn:active {
  transform: translateY(0);
}

.nav-btn::before {
  content: "旅游推荐";
  margin-right: 4px;
}

.nav-btn::after {
  content: "→";
  font-size: 18px;
  transition: transform 0.3s ease;
}

.nav-btn:hover::after {
  transform: translateX(5px);
}
</style>
