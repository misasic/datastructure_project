<template>
  <div class="diary-detail">
    <div v-if="loading" class="loading">
      <el-skeleton :rows="6" animated />
    </div>
    <template v-else>
      <div class="diary-header">
        <h1>{{ diaryData.title || '无标题' }}</h1>
        <div class="diary-meta">
          <span class="author">作者：{{ diaryData.author || '未知作者' }}</span>
          <span class="time">更新时间：{{ formatDate(diaryData.updated_at) }}</span>
          <el-tag 
            v-if="diaryData.content_compressed" 
            type="success" 
            size="small"
            class="compression-tag"
          >
            已压缩 ({{ diaryData.content_compression_ratio }}%)
          </el-tag>
        </div>
        <div class="diary-stats">
          <span class="views">
            <i class="el-icon-view"></i> {{ diaryData.views || 0 }} 次浏览
          </span>
          <el-button 
            type="text" 
            :class="{ 'is-liked': diaryData.is_liked }"
            @click="handleLike"
          >
            <i class="el-icon-star-on"></i> 
            {{ diaryData.likes || 0 }} 个赞
          </el-button>
        </div>
      </div>

      <div class="diary-content">
        {{ diaryData.content || '暂无内容' }}
      </div>

      <div v-if="diaryData.images && diaryData.images.length > 0" class="diary-images">
        <h3>图片</h3>
        <div class="image-grid">
          <div v-for="image in diaryData.images" :key="image.id" class="image-item">
            <el-image
              :src="image.image_url"
              :preview-src-list="diaryData.images.map(img => img.image_url)"
              fit="cover"
              class="diary-image"
            >
              <template #error>
                <div class="image-slot">
                  <i class="el-icon-picture-outline"></i>
                </div>
              </template>
            </el-image>
          </div>
        </div>
      </div>

      <div v-if="diaryData.images && diaryData.images[0] && diaryData.images[0].aigc_video_url" class="diary-video">
        <h3>AI生成视频</h3>
        <div class="video-container">
          <video 
            :src="diaryData.images[0].aigc_video_url"
            controls
            class="video-player"
            preload="metadata"
          >
            <source :src="diaryData.images[0].aigc_video_url" type="video/mp4">
            您的浏览器不支持视频播放
          </video>
        </div>
      </div>

      <div class="diary-actions">
        <el-button @click="goBack">返回</el-button>
      </div>
    </template>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'DiaryDetail',
  data() {
    return {
      loading: true,
      diaryData: {
        id: null,
        title: '',
        content: '',
        author: '',
        views: 0,
        likes: 0,
        is_liked: 0,
        date: null,
        created_at: null,
        updated_at: null,
        content_compressed: false,
        content_compression_ratio: null,
        images: []
      }
    }
  },
  created() {
    this.loadDiary()
  },
  methods: {
    async loadDiary() {
      this.loading = true
      try {
        const user = localStorage.getItem('user')
        if (!user) {
          this.$message.error('请先登录')
          this.$router.push('/login')
          return
        }

        const userId = JSON.parse(user).id
        const headers = { 
          'user-id': userId,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
        
        console.log('开始加载日记，ID:', this.$route.params.id)
        const res = await axios.get(`/diaries/${this.$route.params.id}`, { 
          headers,
          params: {
            _t: new Date().getTime()
          }
        })
        
        console.log('收到响应:', res)
        
        if (res.data.success && res.data.data) {
          console.log('获取到的日记数据:', res.data.data)
          const data = res.data.data
          
          // 重置日记数据
          this.diaryData = {
            id: data.id || null,
            title: data.title || '无标题',
            content: data.content || '暂无内容',
            author: data.author || '未知作者',
            views: parseInt(data.views) || 0,
            likes: parseInt(data.likes) || 0,
            is_liked: parseInt(data.is_liked) || 0,
            date: data.date || null,
            created_at: data.created_at || null,
            updated_at: data.updated_at || null,
            content_compressed: data.content_compressed || false,
            content_compression_ratio: data.content_compression_ratio || null,
            images: Array.isArray(data.images) ? data.images : []
          }
          
          console.log('处理后的日记数据:', this.diaryData)
        } else {
          throw new Error(res.data.message || '获取日记失败')
        }
      } catch (err) {
        console.error('加载日记失败:', err)
        this.$message.error(err.message || '加载日记失败')
        // 重置为默认值
        this.diaryData = {
          id: null,
          title: '加载失败',
          content: '无法加载日记内容',
          author: '未知作者',
          views: 0,
          likes: 0,
          is_liked: 0,
          date: null,
          created_at: null,
          updated_at: null,
          content_compressed: false,
          content_compression_ratio: null,
          images: []
        }
      } finally {
        this.loading = false
      }
    },
    async handleLike() {
      try {
        const user = localStorage.getItem('user')
        if (!user) {
          this.$message.error('请先登录')
          this.$router.push('/login')
          return
        }

        const userId = JSON.parse(user).id
        const headers = { 
          'user-id': userId,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
        
        const res = await axios.post(`/diaries/${this.$route.params.id}/like`, {}, { headers })
        
        if (res.data.success) {
          // 直接使用后端返回的点赞数
          this.diaryData.likes = res.data.likes
          this.diaryData.is_liked = 1
          this.$message.success(res.data.message)
        } else {
          if (res.data.message === '您已经点赞过了') {
            this.$message.info(res.data.message)
            // 更新点赞状态
            this.diaryData.is_liked = 1
            this.diaryData.likes = res.data.likes
          } else {
            this.$message.error(res.data.message)
          }
        }
      } catch (err) {
        console.error('点赞失败:', err)
        if (err.response?.data?.message === '您已经点赞过了') {
          this.$message.info(err.response.data.message)
          // 更新点赞状态
          this.diaryData.is_liked = 1
          this.diaryData.likes = err.response.data.likes
        } else {
          this.$message.error(err.response?.data?.message || '点赞失败')
        }
      }
    },
    formatDate(date) {
      if (!date) return '未知时间'
      return new Date(date).toLocaleString()
    },
    goBack() {
      this.$router.back()
    }
  }
}
</script>

<style scoped>
.diary-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  padding: 20px;
}

.diary-header {
  margin-bottom: 30px;
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
}

.diary-header h1 {
  margin: 0 0 15px 0;
  color: #303133;
}

.diary-meta {
  display: flex;
  gap: 20px;
  color: #606266;
  margin-bottom: 15px;
}

.diary-stats {
  display: flex;
  gap: 20px;
  color: #606266;
}

.diary-stats .views {
  display: flex;
  align-items: center;
  gap: 5px;
}

.diary-stats .el-button {
  padding: 0;
  color: #606266;
}

.diary-stats .is-liked {
  color: #409EFF;
}

.diary-content {
  font-size: 16px;
  line-height: 1.8;
  color: #303133;
  margin-bottom: 30px;
  white-space: pre-wrap;
}

.diary-images {
  margin-top: 30px;
}

.diary-images h3 {
  margin-bottom: 15px;
  color: #303133;
}

.diary-image {
  width: 200px;
  height: 200px;
  margin: 0 10px 10px 0;
  border-radius: 4px;
  cursor: pointer;
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

.diary-video {
  margin-top: 30px;
}

.diary-video h3 {
  margin-bottom: 15px;
  color: #303133;
}

.video-container {
  max-width: 1280px;
  margin: 0 auto;
}

.video-player {
  width: 100%;
  border-radius: 8px;
  background: #000;
}

.diary-actions {
  margin-top: 30px;
  text-align: center;
}

.compression-tag {
  margin-left: 10px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.image-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f7fa;
}
</style> 