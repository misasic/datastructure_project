<template>
  <div class="recommendation-page">
    <header class="header">
      <h1>旅游推荐</h1>
      <div class="user-info" v-if="user">
        <span>欢迎, {{ user.username }}</span>
        <button @click="goToMap" class="nav-btn">地图</button>
        <button @click="logout" class="logout-btn">退出</button>
      </div>
    </header>
    
    <div class="tabs">
      <button 
        :class="{ active: activeTab === 'scenicSpots' }" 
        @click="activeTab = 'scenicSpots'"
      >
        景点推荐
      </button>
      <button 
        :class="{ active: activeTab === 'schools' }" 
        @click="activeTab = 'schools'"
      >
        学校推荐
      </button>
      <button 
        :class="{ active: activeTab === 'preferences' }" 
        @click="activeTab = 'preferences'"
      >
        个人偏好设置
      </button>
    </div>
    
    <div class="main-content">
      <!-- 景点推荐 -->
      <div v-if="activeTab === 'scenicSpots'" class="recommendation-list">
        <div class="filters">
          <div class="search-box">
            <input 
              type="text" 
              v-model="scenicSearch" 
              placeholder="搜索景点名称、关键词..." 
              @keyup.enter="fetchScenicSpots"
            />
            <button @click="fetchScenicSpots">搜索</button>
          </div>
          
          <div class="filter-options">
            <select v-model="scenicCategory" @change="fetchScenicSpots">
              <option value="">全部分类</option>
              <option v-for="category in scenicCategories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
            
            <select v-model="scenicSortBy" @change="fetchScenicSpots">
              <option value="popularity">按热度排序</option>
              <option value="rating">按评价排序</option>
            </select>
          </div>
        </div>
        
        <div class="items-container">
          <div 
            v-for="spot in scenicSpots" 
            :key="spot.id" 
            class="item-card"
          >
            <div class="item-image">
              <img 
                :src="spot.image_url" 
                :alt="spot.name"
                @error="handleImageError($event, '景点')"
              />
            </div>
            <div class="item-info">
              <h3>{{ spot.name }}</h3>
              <p class="category">{{ spot.category }}</p>
              <p class="description">{{ spot.description || '暂无描述' }}</p>
              <div class="stats">
                <span class="popularity">热度: {{ spot.popularity.toFixed(1) }}</span>
                <span class="rating">评分: {{ spot.rating.toFixed(1) }}</span>
              </div>
              <div class="keywords" v-if="spot.keywords">
                <span v-for="(keyword, index) in spot.keywords.split(',')" :key="index" class="keyword">
                  {{ keyword.trim() }}
                </span>
              </div>
            </div>
          </div>
          
          <div v-if="scenicSpots.length === 0" class="no-data">
            暂无符合条件的景点
          </div>
        </div>
      </div>
      
      <!-- 学校推荐 -->
      <div v-if="activeTab === 'schools'" class="recommendation-list">
        <div class="filters">
          <div class="search-box">
            <input 
              type="text" 
              v-model="schoolSearch" 
              placeholder="搜索学校名称、关键词..." 
              @keyup.enter="fetchSchools"
            />
            <button @click="fetchSchools">搜索</button>
          </div>
          
          <div class="filter-options">
            <select v-model="schoolCategory" @change="fetchSchools">
              <option value="">全部分类</option>
              <option v-for="category in schoolCategories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
            
            <select v-model="schoolSortBy" @change="fetchSchools">
              <option value="popularity">按热度排序</option>
              <option value="rating">按评价排序</option>
            </select>
          </div>
        </div>
        
        <div class="items-container">
          <div 
            v-for="school in schools" 
            :key="school.id" 
            class="item-card"
          >
            <div class="item-image">
              <img 
                :src="school.image_url" 
                :alt="school.name"
                @error="handleImageError($event, '学校')"
              />
            </div>
            <div class="item-info">
              <h3>{{ school.name }}</h3>
              <p class="category">{{ school.category }}</p>
              <p class="description">{{ school.description || '暂无描述' }}</p>
              <div class="stats">
                <span class="popularity">热度: {{ school.popularity.toFixed(1) }}</span>
                <span class="rating">评分: {{ school.rating.toFixed(1) }}</span>
              </div>
              <div class="keywords" v-if="school.keywords">
                <span v-for="(keyword, index) in school.keywords.split(',')" :key="index" class="keyword">
                  {{ keyword.trim() }}
                </span>
              </div>
            </div>
          </div>
          
          <div v-if="schools.length === 0" class="no-data">
            暂无符合条件的学校
          </div>
        </div>
      </div>
      
      <!-- 个人偏好设置 -->
      <div v-if="activeTab === 'preferences'" class="preferences-section">
        <h2>设置您的旅游偏好</h2>
        <p>设置您对各类景点和学校的兴趣程度，系统将根据您的偏好为您推荐合适的目的地。</p>
        
        <div class="preference-categories">
          <div v-for="category in allCategories" :key="category" class="preference-item">
            <label>{{ category }}</label>
            <div class="slider-container">
              <input 
                type="range" 
                min="0" 
                max="5" 
                step="0.5"
                v-model="preferences[category]" 
                @change="updatePreference(category)"
              />
              <span>{{ preferences[category] || 0 }}</span>
            </div>
          </div>
        </div>
        
        <div v-if="preferenceMessage" class="message" :class="preferenceSuccess ? 'success' : 'error'">
          {{ preferenceMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'RecommendationPage',
  data() {
    return {
      user: null,
      activeTab: 'scenicSpots',
      
      // 景点数据
      scenicSpots: [],
      scenicCategories: [],
      scenicSearch: '',
      scenicCategory: '',
      scenicSortBy: 'popularity',
      
      // 学校数据
      schools: [],
      schoolCategories: [],
      schoolSearch: '',
      schoolCategory: '',
      schoolSortBy: 'popularity',
      
      // 偏好设置
      allCategories: [],
      preferences: {},
      preferenceMessage: '',
      preferenceSuccess: false
    };
  },
  created() {
    // 从本地存储获取用户信息
    const userJson = localStorage.getItem('user');
    if (userJson) {
      this.user = JSON.parse(userJson);
    } else {
      this.$router.push('/');
    }
    
    // 获取景点和学校数据
    this.fetchScenicSpots();
    this.fetchSchools();
    
    // 获取分类
    this.fetchCategories();
    
    // 如果用户已登录，获取用户偏好
    if (this.user) {
      this.fetchUserPreferences();
    }
  },
  methods: {
    // 处理图片加载错误
    handleImageError(event, type) {
      // 使用base64编码的默认图片
      const defaultImages = {
        '景点': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM0YTkwZTIiLz4KICA8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSI+5pmv54K55Zu+54mHPC90ZXh0Pgo8L3N2Zz4=',
        '学校': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM1MGM4NzgiLz4KICA8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSI+5a2m5qCh5Zu+54mHPC90ZXh0Pgo8L3N2Zz4='
      };
      event.target.src = defaultImages[type] || defaultImages['景点'];
    },
    
    async fetchScenicSpots() {
      try {
        console.log('正在获取景点推荐...');
        // 构建查询参数
        const params = {
          sortBy: this.scenicSortBy,
          limit: 10
        };
        
        if (this.scenicCategory) {
          params.category = this.scenicCategory;
        }
        
        if (this.scenicSearch) {
          params.keyword = this.scenicSearch;
        }
        
        const headers = {};
        if (this.user) {
          headers['user-id'] = this.user.id;
        }
        
        console.log('景点请求参数:', params);
        console.log('景点请求头:', headers);
        console.log('完整请求URL:', axios.defaults.baseURL + '/scenic-spots');
        
        // 使用axios默认配置的baseURL，它已经在main.js中动态设置
        // 不再硬编码localhost:3000
        const response = await axios.get('/scenic-spots', { 
          params,
          headers
        });
        
        console.log('景点响应:', response.data);
        
        if (response.data.success) {
          this.scenicSpots = response.data.data;
          console.log('获取到景点数量:', this.scenicSpots.length);
        } else {
          console.error('获取景点推荐失败:', response.data.message);
          // 如果服务器响应不成功，显示错误消息
          alert('获取景点推荐失败: ' + response.data.message);
        }
      } catch (err) {
        console.error('获取景点推荐失败:', err);
        console.error('错误详情:', err.message);
        if (err.response) {
          console.error('响应状态:', err.response.status);
          console.error('响应数据:', err.response.data);
        } else if (err.request) {
          // 请求已发送但没有收到响应
          console.error('未收到响应，请检查服务器是否运行');
        } else {
          // 设置请求时发生了错误
          console.error('请求配置错误:', err.message);
        }
        // 在界面上显示错误
        alert('获取景点数据失败，请检查网络连接和服务器状态');
      }
    },
    
    async fetchSchools() {
      try {
        console.log('正在获取学校推荐...');
        // 构建查询参数
        const params = {
          sortBy: this.schoolSortBy,
          limit: 10
        };
        
        if (this.schoolCategory) {
          params.category = this.schoolCategory;
        }
        
        if (this.schoolSearch) {
          params.keyword = this.schoolSearch;
        }
        
        const headers = {};
        if (this.user) {
          headers['user-id'] = this.user.id;
        }
        
        console.log('学校请求参数:', params);
        console.log('学校请求头:', headers);
        
        // 使用axios默认配置的baseURL，它已经在main.js中动态设置
        // 不再硬编码localhost:3000
        const response = await axios.get('/schools', { 
          params,
          headers
        });
        
        console.log('学校响应:', response.data);
        
        if (response.data.success) {
          this.schools = response.data.data;
          console.log('获取到学校数量:', this.schools.length);
        } else {
          console.error('获取学校推荐失败:', response.data.message);
          // 如果服务器响应不成功，显示错误消息
          alert('获取学校推荐失败: ' + response.data.message);
        }
      } catch (err) {
        console.error('获取学校推荐失败:', err);
        console.error('错误详情:', err.message);
        if (err.response) {
          console.error('响应状态:', err.response.status);
          console.error('响应数据:', err.response.data);
        } else if (err.request) {
          // 请求已发送但没有收到响应
          console.error('未收到响应，请检查服务器是否运行');
        } else {
          // 设置请求时发生了错误
          console.error('请求配置错误:', err.message);
        }
        // 在界面上显示错误
        alert('获取学校数据失败，请检查网络连接和服务器状态');
      }
    },
    
    async fetchCategories() {
      try {
        // 获取景点分类
        const scenicResponse = await axios.get('/scenic-spot-categories');
        if (scenicResponse.data.success) {
          this.scenicCategories = scenicResponse.data.data;
        }
        
        // 获取学校分类
        const schoolResponse = await axios.get('/school-categories');
        if (schoolResponse.data.success) {
          this.schoolCategories = schoolResponse.data.data;
        }
        
        // 合并所有分类
        this.allCategories = [...new Set([
          ...this.scenicCategories,
          ...this.schoolCategories
        ])];
      } catch (err) {
        console.error('获取分类失败:', err);
      }
    },
    
    async fetchUserPreferences() {
      try {
        // 这里应该有API来获取用户偏好，但示例中我们假设已有该API
        // 实际项目中应该实现此API
        // 这里使用模拟数据
        const preferences = {
          '自然风光': 4,
          '历史遗迹': 3.5,
          '名校': 5,
          '博物馆': 2
        };
        
        this.preferences = preferences;
      } catch (err) {
        console.error('获取用户偏好失败:', err);
      }
    },
    
    async updatePreference(category) {
      if (!this.user) return;
      
      try {
        const interestLevel = parseFloat(this.preferences[category] || 0);
        
        const response = await axios.post('/user-preference', {
          userId: this.user.id,
          category,
          interestLevel
        });
        
        if (response.data.success) {
          this.preferenceSuccess = true;
          this.preferenceMessage = `已更新对"${category}"的偏好设置`;
          
          // 3秒后清除消息
          setTimeout(() => {
            this.preferenceMessage = '';
          }, 3000);
          
          // 更新推荐列表
          this.fetchScenicSpots();
          this.fetchSchools();
        }
      } catch (err) {
        console.error('更新用户偏好失败:', err);
        this.preferenceSuccess = false;
        this.preferenceMessage = '偏好设置更新失败';
      }
    },
    
    logout() {
      localStorage.removeItem('user');
      this.$router.push('/');
    },
    
    goToMap() {
      this.$router.push('/map');
    }
  }
};
</script>

<style scoped>
.recommendation-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: "SimSun", serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h1 {
  margin: 0;
  color: #333;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-info span {
  margin-right: 15px;
}

.logout-btn {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
}

.tabs button {
  padding: 10px 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  border-bottom: 2px solid transparent;
}

.tabs button.active {
  border-bottom: 2px solid #4d5a69;
  color: #4d5a69;
  font-weight: bold;
}

.filters {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.search-box {
  display: flex;
}

.search-box input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  width: 250px;
}

.search-box button {
  padding: 8px 15px;
  background-color: #6c7a89;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

.filter-options {
  display: flex;
}

.filter-options select {
  margin-left: 10px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.items-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.item-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.item-card:hover {
  transform: translateY(-5px);
}

.item-image {
  height: 180px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  padding: 15px;
}

.item-info h3 {
  margin-top: 0;
  margin-bottom: 5px;
  color: #333;
}

.category {
  color: #666;
  font-size: 14px;
  margin-bottom: 10px;
}

.description {
  font-size: 14px;
  color: #555;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.popularity, .rating {
  font-size: 14px;
  color: #6c7a89;
}

.keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.keyword {
  background-color: #f0f0f0;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 12px;
  color: #555;
}

.no-data {
  grid-column: 1 / -1;
  text-align: center;
  padding: 30px;
  color: #999;
}

.preferences-section {
  max-width: 600px;
  margin: 0 auto;
}

.preferences-section h2 {
  margin-top: 0;
  color: #333;
}

.preference-categories {
  margin-top: 20px;
}

.preference-item {
  margin-bottom: 15px;
}

.preference-item label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.slider-container {
  display: flex;
  align-items: center;
}

.slider-container input {
  flex: 1;
  margin-right: 10px;
}

.message {
  margin-top: 20px;
  padding: 10px;
  border-radius: 4px;
}

.success {
  background-color: #e6f7e6;
  color: #2e7d32;
}

.error {
  background-color: #ffebee;
  color: #c62828;
}
</style> 