<template>
  <div class="diary-container">
    <div class="header">
      <h1>日记</h1>
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索日记..."
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-select v-model="searchType" style="width: 100px">
              <el-option label="标题" value="title" />
              <el-option label="内容" value="content" />
            </el-select>
          </template>
        </el-input>
      </div>
    </div>

    <div class="tabs">
      <el-tabs v-model="activeTab" @tab-click="handleTabChange">
        <el-tab-pane label="所有日记" name="all">
          <div class="diary-list">
            <el-card v-for="diary in allDiaries" :key="diary.id" class="diary-card" shadow="hover">
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
        </el-tab-pane>
        <el-tab-pane label="我的日记" name="my">
          <div class="diary-list">
            <el-card v-for="diary in diaries" :key="diary.id" class="diary-card" shadow="hover">
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
                    <div class="diary-actions">
                      <el-button type="text" size="small" @click.stop="editDiary(diary.id)">
                        <i class="el-icon-edit"></i> 编辑
                      </el-button>
                      <el-button type="text" size="small" @click.stop="deleteDiary(diary.id)">
                        <i class="el-icon-delete"></i> 删除
                      </el-button>
                    </div>
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
        </el-tab-pane>
        <el-tab-pane label="热门日记" name="popular">
          <div class="diary-list">
            <el-card v-for="diary in popularDiaries" :key="diary.id" class="diary-card">
              <div class="diary-content">
                <div class="diary-image">
                  <el-image
                    :src="getDiaryImage(diary)"
                    fit="cover"
                    class="image"
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
                    <span class="stat-item"><i class="el-icon-view"></i> {{ diary.views }} 次浏览</span>
                    <span class="stat-item"><i class="el-icon-star-on"></i> {{ diary.likes }} 个赞</span>
                    <span class="time">{{ formatDate(diary.updated_at) }}</span>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
        </el-tab-pane>
        <el-tab-pane label="最受欢迎" name="most-liked">
          <div class="diary-list">
            <el-card v-for="diary in mostLikedDiaries" :key="diary.id" class="diary-card">
              <div class="diary-content">
                <div class="diary-image">
                  <el-image
                    :src="getDiaryImage(diary)"
                    fit="cover"
                    class="image"
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
                    <span class="stat-item"><i class="el-icon-view"></i> {{ diary.views }} 次浏览</span>
                    <span class="stat-item"><i class="el-icon-star-on"></i> {{ diary.likes }} 个赞</span>
                    <span class="time">{{ formatDate(diary.updated_at) }}</span>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-button type="primary" class="create-btn" @click="createDiary">
      <i class="el-icon-plus"></i> 写新日记
    </el-button>
  </div>
</template>

<script>
import axios from 'axios'
import defaultImage from '@/assets/photo.jpg'

export default {
  name: 'Diary',
  data() {
    return {
      diaries: [],
      allDiaries: [],
      popularDiaries: [],
      mostLikedDiaries: [],
      activeTab: 'all',
      searchKeyword: '',
      searchType: 'title',
      defaultImage
    }
  },
  created() {
    this.loadDiaries()
  },
  methods: {
    getDiaryImage(diary) {
      if (diary.images && Array.isArray(diary.images) && diary.images.length > 0) {
        return diary.images[0].image_url
      }
      return this.defaultImage
    },
    async loadDiaries() {
      try {
        const user = localStorage.getItem('user')
        if (!user) {
          this.$message.error('请先登录')
          this.$router.push('/login')
          return
        }

        const userId = JSON.parse(user).id
        const headers = { 'user-id': userId }

        // 加载所有日记
        const allDiariesRes = await axios.get('/diaries/all', { headers })
        if (allDiariesRes.data.success) {
          this.allDiaries = allDiariesRes.data.data || []
        } else {
          throw new Error(allDiariesRes.data.message)
        }

        // 加载我的日记
        const myDiariesRes = await axios.get('/diaries', { headers })
        if (myDiariesRes.data.success) {
          this.diaries = myDiariesRes.data.data || []
        } else {
          throw new Error(myDiariesRes.data.message)
        }

        // 加载热门日记
        const popularRes = await axios.get('/diaries/popular', { headers })
        if (popularRes.data.success) {
          this.popularDiaries = Array.isArray(popularRes.data.data) 
            ? popularRes.data.data 
            : [popularRes.data.data]
        } else {
          throw new Error(popularRes.data.message)
        }

        // 加载最受欢迎日记
        const mostLikedRes = await axios.get('/diaries/most-liked', { headers })
        if (mostLikedRes.data.success) {
          this.mostLikedDiaries = Array.isArray(mostLikedRes.data.data)
            ? mostLikedRes.data.data
            : [mostLikedRes.data.data]
        } else {
          throw new Error(mostLikedRes.data.message)
        }
      } catch (err) {
        console.error('加载日记失败:', err)
        this.$message.error(err.message || '加载日记失败')
      }
    },
    async handleSearch() {
      if (!this.searchKeyword) {
        this.loadDiaries();
        return;
      }

      try {
        const user = localStorage.getItem('user');
        if (!user) {
          this.$message.error('请先登录');
          this.$router.push('/login');
          return;
        }

        // 跳转到搜索结果页面
        this.$router.push({
          path: '/search',
          query: {
            keyword: this.searchKeyword,
            type: this.searchType
          }
        });
      } catch (err) {
        console.error('搜索失败:', err);
        this.$message.error(err.message || '搜索失败');
      }
    },
    handleTabChange() {
      this.searchKeyword = ''
      this.loadDiaries()
    },
    viewDiary(id) {
      this.$router.push(`/diary/${id}`)
    },
    createDiary() {
      this.$router.push('/diary/create')
    },
    formatDate(date) {
      return new Date(date).toLocaleString()
    },
    async editDiary(id) {
      try {
        this.$router.push(`/diary/edit/${id}`);
      } catch (err) {
        console.error('跳转到编辑页面失败:', err);
        this.$message.error('跳转到编辑页面失败');
      }
    },
    async deleteDiary(id) {
      try {
        await this.$confirm('确定要删除这篇日记吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });

        const user = localStorage.getItem('user');
        if (!user) {
          this.$message.error('请先登录');
          this.$router.push('/login');
          return;
        }

        const userId = JSON.parse(user).id;
        const headers = { 'user-id': userId };

        const res = await axios.delete(`/diaries/${id}`, { headers });
        
        if (res.data.success) {
          this.$message.success('删除成功');
          // 重新加载日记列表
          this.loadDiaries();
        } else {
          throw new Error(res.data.message);
        }
      } catch (err) {
        if (err === 'cancel') {
          return;
        }
        console.error('删除日记失败:', err);
        this.$message.error(err.message || '删除日记失败');
      }
    }
  }
}
</script>

<style scoped>
.diary-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 10px;
}

.header h1 {
  margin: 0;
  color: #303133;
  font-size: 24px;
}

.search-box {
  width: 400px;
}

.diary-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-top: 20px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  padding: 10px;
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

.diary-actions {
  display: flex;
  gap: 10px;
  margin-top: 5px;
}

.diary-actions .el-button {
  padding: 2px 5px;
}

.diary-actions .el-button:hover {
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
  color: #909399;
  font-size: 14px;
}

.stat-item i {
  font-size: 16px;
  margin-right: 2px;
}

.time {
  margin-left: auto;
  font-size: 13px;
  color: #909399;
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

.create-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.create-btn i {
  margin-right: 5px;
}
</style>
