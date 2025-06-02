<template>
  <div class="diary-create">
    <div class="header">
      <el-button icon="el-icon-back" @click="$router.back()">返回</el-button>
      <h1>写新日记</h1>
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
            action="/images/upload"
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
            :with-credentials="true"
          >
            <i class="el-icon-plus"></i>
            <template #tip>
              <div class="el-upload__tip">只能上传jpg/png文件，且不超过2MB</div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm">发布</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'DiaryCreate',
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
      }
    }
  },
  created() {
    const user = localStorage.getItem('user')
    if (user) {
      this.uploadHeaders['user-id'] = JSON.parse(user).id
    }
  },
  methods: {
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
      console.log('上传成功响应:', response);
      if (response.success) {
        this.fileList.push({
          name: file.name,
          url: response.data.image_url
        })
        this.$message.success('图片上传成功')
      } else {
        this.$message.error(response.message || '图片上传失败')
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
        
        // 创建日记
        const res = await axios.post('/diaries', this.form, { headers })
        
        if (res.data.success) {
          const diaryId = res.data.data.id
          
          // 上传图片
          if (this.fileList.length > 0) {
            const uploadPromises = this.fileList.map(file => 
              axios.post(`/diaries/${diaryId}/images`, {
                image_url: file.url
              }, { headers })
            )
            
            await Promise.all(uploadPromises)
          }
          
          this.$message.success('日记发布成功')
          this.$router.push('/diary')
        } else {
          throw new Error(res.data.message)
        }
      } catch (err) {
        console.error('发布日记失败:', err)
        this.$message.error(err.message || '发布日记失败')
      }
    }
  }
}
</script>

<style scoped>
.diary-create {
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
</style> 