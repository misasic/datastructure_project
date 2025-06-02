<template>
  <div class="search-results">
    <div class="header">
      <h1>搜索结果</h1>
      <div class="search-options">
        <el-select v-model="searchType" placeholder="搜索类型" style="width: 120px">
          <el-option label="标题搜索" value="title" />
          <el-option label="全文搜索" value="content" />
        </el-select>
        <el-input
          v-model="searchKeyword"
          placeholder="输入搜索关键词..."
          @keyup.enter="handleSearch"
          style="width: 300px; margin: 0 10px"
        >
          <template #append>
            <el-button @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
        <el-select v-model="sortBy" placeholder="排序方式" @change="handleSort">
          <el-option label="按热度排序" value="views" />
          <el-option label="按点赞排序" value="likes" />
          <el-option label="按时间排序" value="time" />
        </el-select>
      </div>
    </div>

    <div class="results-container">
      <div v-if="loading" class="loading">
        <el-skeleton :rows="6" animated />
      </div>
      <template v-else>
        <div v-if="searchResults.length === 0" class="no-results">
          未找到相关日记
        </div>
        <div v-else class="diary-list">
          <el-card v-for="diary in searchResults" :key="diary.id" class="diary-card" shadow="hover">
            <div class="diary-content">
              <div class="diary-image">
                <el-image
                  :src="getDiaryImage(diary)"
                  fit="cover"
                  class="image"
                  :preview-src-list="diary.images ? diary.images.map(img => img.image_url) : []"
                >
                  <template #error>
                    <div class="image-slot">
                      <i class="el-icon-picture-outline"></i>
                    </div>
                  </template>
                </el-image>
              </div>
              <div class="diary-info">
                <div class="diary-header">
                  <h3 @click="viewDiary(diary.id)">{{ diary.title }}</h3>
                  <span class="author">作者：{{ diary.author }}</span>
                </div>
                <div class="diary-stats">
                  <span class="stat-item"><i class="el-icon-view"></i> {{ diary.views || 0 }} 次浏览</span>
                  <span class="stat-item"><i class="el-icon-star-on"></i> {{ diary.likes || 0 }} 个赞</span>
                  <span class="time">{{ formatDate(diary.updated_at) }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import defaultImage from '@/assets/photo.jpg'
import { debounce } from 'lodash'

export default {
  name: 'SearchResults',
  data() {
    return {
      searchKeyword: '',
      searchType: 'title',
      sortBy: 'views',
      searchResults: [],
      loading: false,
      defaultImage,
      resizeObserver: null
    }
  },
  created() {
    // 从路由参数中获取搜索关键词和类型
    const { keyword, type } = this.$route.query
    if (keyword) {
      this.searchKeyword = keyword
      this.searchType = type || 'title'
      this.handleSearch()
    }
  },
  mounted() {
    // 使用防抖处理窗口大小变化
    this.resizeObserver = new ResizeObserver(
      debounce(() => {
        this.$nextTick(() => {
          // 触发重新渲染
          this.searchResults = [...this.searchResults]
        })
      }, 100)
    )
    
    // 观察容器元素
    const container = this.$el.querySelector('.results-container')
    if (container) {
      this.resizeObserver.observe(container)
    }
  },
  beforeUnmount() {
    // 清理 ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
  },
  methods: {
    async handleSearch() {
      if (!this.searchKeyword) return
      
      this.loading = true
      try {
        const user = localStorage.getItem('user')
        if (!user) {
          this.$message.error('请先登录')
          this.$router.push('/login')
          return
        }

        const userId = JSON.parse(user).id
        const headers = { 'user-id': userId }
        
        const res = await axios.get('/diaries/search', {
          headers,
          params: {
            keyword: this.searchKeyword,
            type: this.searchType,
            sortBy: this.sortBy
          }
        })

        if (res.data.success && res.data.data) {
          console.log('获取到的搜索结果:', res.data.data)
          // 确保返回的是数组
          this.searchResults = Array.isArray(res.data.data) ? res.data.data : [res.data.data]
          console.log('处理后的搜索结果:', this.searchResults)
        } else {
          this.$message.error(res.data.message || '搜索失败')
          this.searchResults = []
        }
      } catch (err) {
        console.error('搜索失败:', err)
        this.$message.error('搜索失败')
        this.searchResults = []
      } finally {
        this.loading = false
      }
    },
    handleSort() {
      this.handleSearch()
    },
    getDiaryImage(diary) {
      // 如果日记有图片数组且长度大于0，返回第一张图片的URL
      if (diary.images && Array.isArray(diary.images) && diary.images.length > 0) {
        return diary.images[0].image_url
      }
      // 如果没有图片，返回默认图片
      return this.defaultImage
    },
    viewDiary(id) {
      this.$router.push(`/diary/${id}`)
    },
    formatDate(date) {
      return new Date(date).toLocaleString()
    }
  }
}
</script>

<style scoped>
.search-results {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  margin-bottom: 30px;
  flex-shrink: 0;
}

.header h1 {
  margin: 0 0 20px 0;
  color: #303133;
}

.search-options {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.results-container {
  flex: 1;
  min-height: 0;
  position: relative;
}

.loading {
  padding: 20px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-results {
  text-align: center;
  color: #909399;
  font-size: 16px;
  padding: 40px 0;
}

.diary-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  padding: 10px;
  height: 100%;
  overflow-y: auto;
}

.diary-list::-webkit-scrollbar {
  width: 6px;
}

.diary-list::-webkit-scrollbar-thumb {
  background-color: #909399;
  border-radius: 3px;
}

.diary-list::-webkit-scrollbar-track {
  background-color: #f5f7fa;
}

.diary-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
  height: fit-content;
}

.diary-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.diary-content {
  display: flex;
  gap: 15px;
  padding: 5px;
}

.diary-image {
  width: 120px;
  height: 120px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
}

.diary-image .image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.diary-card:hover .image {
  transform: scale(1.05);
}

.diary-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.diary-header {
  margin-bottom: 10px;
}

.diary-header h3 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 18px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.diary-header h3:hover {
  color: #409EFF;
}

.author {
  font-size: 14px;
  color: #909399;
}

.diary-stats {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #909399;
  font-size: 14px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-item i {
  font-size: 16px;
  margin-right: 2px;
}

.time {
  margin-left: auto;
  font-size: 13px;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 20px;
}
</style> 