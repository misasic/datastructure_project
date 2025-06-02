<template>
  <div class="diary-edit">
    <div class="header">
      <el-button icon="el-icon-back" @click="$router.back()">返回</el-button>
      <h1>编辑日记</h1>
    </div>

    <div class="form-container">
      <el-form :model="form" :rules="rules" ref="form" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入日记标题"></el-input>
        </el-form-item>
        
        <el-form-item label="内容" prop="content">
          <el-input
            type="textarea"
            v-model="form.content"
            :rows="10"
            placeholder="请输入日记内容"
          ></el-input>
        </el-form-item>

        <el-form-item label="图片">
          <el-upload
            class="diary-uploader"
            action="http://localhost:3000/api/images/upload"
            :headers="uploadHeaders"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
            :file-list="fileList"
            list-type="picture-card"
            multiple
            name="image"
            :show-file-list="true"
            :limit="9"
            :on-exceed="handleExceed"
            :on-remove="handleRemove"
          >
            <i class="el-icon-plus"></i>
            <template #tip>
              <div class="el-upload__tip">只能上传jpg/png文件，且不超过2MB</div>
            </template>
          </el-upload>
          <div v-if="fileList.length > 0" class="image-actions-container">
            <el-button 
              type="success" 
              size="small" 
              @click="showVideoOptions"
              :loading="generatingAIGC"
            >
              <i class="el-icon-magic-stick"></i> AI生成视频
            </el-button>
          </div>
          <div class="video-container" v-if="hasAIGCVideo">
            <div class="video-item">
              <video 
                :src="currentAIGCVideoUrl" 
                controls 
                class="video-player"
                preload="metadata"
                @error="handleVideoError"
                @loadeddata="handleVideoLoaded"
              >
                <source :src="currentAIGCVideoUrl" type="video/mp4">
                您的浏览器不支持视频播放
              </video>
              <div class="video-actions">
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="deleteAIGCVideo"
                >
                  <i class="el-icon-delete"></i> 删除视频
                </el-button>
              </div>
              <div v-if="videoLoading" class="video-loading">
                <i class="el-icon-loading"></i> 加载中...
              </div>
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm">保存</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 添加视频生成选项对话框 -->
    <el-dialog
      title="AI视频生成选项"
      v-model="videoOptionsVisible"
      width="500px"
    >
      <el-form :model="aigcOptions" label-width="100px">
        <el-form-item label="视频风格">
          <el-select v-model="aigcOptions.style">
            <el-option label="电影风格" value="cinematic" />
            <el-option label="动画风格" value="cartoon" />
            <el-option label="写实风格" value="realistic" />
          </el-select>
        </el-form-item>
        <el-form-item label="视频时长">
          <el-input-number 
            v-model="aigcOptions.duration" 
            :min="5" 
            :max="30"
            :step="5"
          />
          <span class="unit">秒</span>
        </el-form-item>
        <el-form-item label="帧率">
          <el-select v-model="aigcOptions.fps">
            <el-option label="24fps" :value="24" />
            <el-option label="30fps" :value="30" />
            <el-option label="60fps" :value="60" />
          </el-select>
        </el-form-item>
        <el-form-item label="分辨率">
          <el-select v-model="aigcOptions.resolution">
            <el-option label="720p" value="1280x720" />
            <el-option label="1080p" value="1920x1080" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="videoOptionsVisible = false">取消</el-button>
          <el-button type="primary" @click="generateAIGCVideo" :loading="generatingAIGC">
            开始生成
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'DiaryEdit',
  data() {
    return {
      form: {
        title: '',
        content: ''
      },
      rules: {
        title: [
          { required: true, message: '请输入日记标题', trigger: 'blur' },
          { min: 1, max: 50, message: '标题长度在1到50个字符之间', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入日记内容', trigger: 'blur' }
        ]
      },
      fileList: [],
      uploadHeaders: {
        'user-id': ''
      },
      originalImages: [],
      deletedImages: [],
      generatingAIGC: false,
      currentAIGCVideoUrl: null,
      videoLoading: false,
      aigcOptions: {
        style: 'cinematic',
        duration: 10,
        fps: 30,
        resolution: '1280x720'
      },
      videoOptionsVisible: false
    }
  },
  computed: {
    hasAIGCVideo() {
      return this.currentAIGCVideoUrl !== null;
    }
  },
  created() {
    const user = localStorage.getItem('user')
    if (user) {
      this.uploadHeaders['user-id'] = JSON.parse(user).id
    }
    this.loadDiary()
  },
  methods: {
    async loadDiary() {
      try {
        const user = localStorage.getItem('user')
        if (!user) {
          this.$message.error('请先登录')
          this.$router.push('/login')
          return
        }

        const userId = JSON.parse(user).id
        const headers = { 'user-id': userId }
        
        const res = await axios.get(`/diaries/${this.$route.params.id}`, { headers })
        
        if (res.data.success && res.data.data) {
          const data = res.data.data
          this.form.title = data.title
          this.form.content = data.content
          
          // 加载图片
          if (data.images && Array.isArray(data.images)) {
            this.originalImages = data.images
            this.fileList = data.images.map(img => ({
              name: img.image_url.split('/').pop(),
              url: img.image_url,
              id: img.id
            }))
            // 检查是否有AIGC视频
            const firstImage = data.images[0]
            if (firstImage && firstImage.aigc_video_url) {
              this.currentAIGCVideoUrl = firstImage.aigc_video_url
            }
          }
        } else {
          throw new Error(res.data.message || '获取日记失败')
        }
      } catch (err) {
        console.error('加载日记失败:', err)
        this.$message.error(err.message || '加载日记失败')
        this.$router.push('/diary')
      }
    },
    beforeUpload(file) {
      const isImage = file.type.startsWith('image/')
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isImage) {
        this.$message.error('只能上传图片文件！')
        return false
      }
      if (!isLt2M) {
        this.$message.error('图片大小不能超过 2MB！')
        return false
      }
      return true
    },
    handleUploadSuccess(response, file) {
      if (response.success) {
        this.fileList.push({
          name: file.name,
          url: response.data.image_url
        })
        this.$message.success('图片上传成功')
      } else {
        this.$message.error(response.message || '图片上传失败')
        // 从文件列表中移除上传失败的文件
        const index = this.fileList.findIndex(item => item.name === file.name)
        if (index !== -1) {
          this.fileList.splice(index, 1)
        }
      }
    },
    handleUploadError(err) {
      console.error('上传失败:', err)
      this.$message.error(err.message || '图片上传失败')
    },
    handleExceed(files, fileList) {
      this.$message.warning(`最多只能上传9张图片，当前已选择 ${fileList.length} 张，本次选择了 ${files.length} 张，共选择了 ${files.length + fileList.length} 张`)
    },
    handleRemove(file) {
      if (file.id) {
        this.deletedImages.push(file.id)
      }
      // 从文件列表中移除
      const index = this.fileList.findIndex(item => item.url === file.url)
      if (index !== -1) {
        this.fileList.splice(index, 1)
      }
    },
    async submitForm() {
      try {
        await this.$refs.form.validate()
        
        const user = localStorage.getItem('user')
        if (!user) {
          this.$message.error('请先登录')
          this.$router.push('/login')
          return
        }

        const userId = JSON.parse(user).id
        const headers = { 'user-id': userId }
        
        // 更新日记
        const res = await axios.put(`/diaries/${this.$route.params.id}`, this.form, { headers })
        
        if (res.data.success) {
          // 删除已标记的图片
          if (this.deletedImages.length > 0) {
            const deletePromises = this.deletedImages.map(imageId =>
              axios.delete(`/diaries/${this.$route.params.id}/images/${imageId}`, { headers })
            )
            await Promise.all(deletePromises)
          }
          
          // 只上传新添加的图片
          const newImages = this.fileList.filter(file => !file.id)
          if (newImages.length > 0) {
            const uploadPromises = newImages.map(file => 
              axios.post(`/diaries/${this.$route.params.id}/images`, {
                image_url: file.url
              }, { headers })
            )
            await Promise.all(uploadPromises)
          }
          
          this.$message.success('日记更新成功')
          this.$router.push('/diary')
        } else {
          throw new Error(res.data.message)
        }
      } catch (err) {
        console.error('更新日记失败:', err)
        this.$message.error(err.message || '更新日记失败')
      }
    },
    showVideoOptions() {
      this.videoOptionsVisible = true;
    },
    async generateAIGCVideo() {
      try {
        if (this.hasAIGCVideo) {
          await this.$confirm('已存在AI生成的视频，生成新的视频将覆盖现有视频，是否继续？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          });
        }

        this.generatingAIGC = true;
        const user = localStorage.getItem('user');
        if (!user) {
          this.$message.error('请先登录');
          this.$router.push('/login');
          return;
        }

        const userId = JSON.parse(user).id;
        const headers = { 'user-id': userId };

        // 获取所有图片的URL，确保是完整的URL
        const imageUrls = this.fileList.map(file => {
          // 如果URL已经是完整的，直接返回
          if (file.url.startsWith('http')) {
            return file.url;
          }
          // 否则构建完整的URL
          return `http://localhost:3000${file.url}`;
        });

        if (imageUrls.length === 0) {
          this.$message.error('请先上传图片');
          return;
        }

        const res = await axios.post(
          `/diaries/${this.$route.params.id}/generate-aigc-video`,
          {
            image_urls: imageUrls,
            options: this.aigcOptions
          },
          { headers }
        );

        if (res.data.success) {
          this.$message.success('AI视频生成成功');
          this.currentAIGCVideoUrl = res.data.video_url;
          this.videoOptionsVisible = false;
        } else {
          throw new Error(res.data.message);
        }
      } catch (err) {
        if (err === 'cancel') {
          return;
        }
        console.error('生成AI视频失败:', err);
        this.$message.error(err.message || '生成AI视频失败');
      } finally {
        this.generatingAIGC = false;
      }
    },
    async deleteAIGCVideo() {
      try {
        await this.$confirm('确定要删除这个AI生成的视频吗？', '提示', {
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

        await axios.delete(
          `/diaries/${this.$route.params.id}/aigc-video`,
          { headers }
        );

        this.$message.success('AI视频删除成功');
        this.currentAIGCVideoUrl = null;
      } catch (err) {
        if (err === 'cancel') {
          return;
        }
        console.error('删除AI视频失败:', err);
        this.$message.error(err.message || '删除AI视频失败');
      }
    },
    handleVideoError() {
      console.error('视频加载失败:', this.currentAIGCVideoUrl);
      this.$message.error('视频加载失败，请稍后重试');
      this.videoLoading = false;
    },
    handleVideoLoaded() {
      console.log('视频加载成功:', this.currentAIGCVideoUrl);
      this.videoLoading = false;
    }
  }
}
</script>

<style scoped>
.diary-edit {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.header h1 {
  margin: 0 0 0 20px;
  color: #2c3e50;
}

.form-container {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.diary-uploader {
  margin-top: 10px;
}

.diary-uploader :deep(.el-upload--picture-card) {
  width: 120px;
  height: 120px;
  line-height: 120px;
}

.diary-uploader :deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 120px;
  height: 120px;
}

.el-upload__tip {
  line-height: 1.2;
  padding-top: 5px;
  color: #909399;
}

.image-actions-container {
  margin-top: 10px;
  margin-bottom: 20px;
}

.video-container {
  margin-top: 20px;
}

.video-item {
  position: relative;
  max-width: 1280px;
  margin: 0 auto;
}

.video-player {
  width: 100%;
  border-radius: 8px;
  background: #000;
}

.video-actions {
  margin-top: 10px;
  text-align: center;
}

.video-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.unit {
  margin-left: 10px;
  color: #909399;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 