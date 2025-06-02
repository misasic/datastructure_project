<template>
  <div class="profile-container">
    <h1>个人信息设置</h1>
    
    <el-form :model="form" :rules="rules" ref="form" label-width="100px" class="profile-form">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="请输入新的用户名"></el-input>
      </el-form-item>
      
      <el-form-item label="新密码" prop="password">
        <el-input 
          v-model="form.password" 
          :type="showPassword ? 'text' : 'password'" 
          placeholder="请输入新密码">
          <template #suffix>
            <el-icon class="show-password" @click="showPassword = !showPassword">
              <component :is="showPassword ? 'ViewIcon' : 'Hide'" />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
      
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input 
          v-model="form.confirmPassword" 
          :type="showPassword ? 'text' : 'password'" 
          placeholder="请再次输入新密码">
          <template #suffix>
            <el-icon class="show-password" @click="showPassword = !showPassword">
              <component :is="showPassword ? 'ViewIcon' : 'Hide'" />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="submitForm">保存修改</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { View as ViewIcon, Hide } from '@element-plus/icons-vue'

export default {
  name: 'Profile',
  components: {
    ViewIcon,
    Hide
  },
  data() {
    // 密码确认验证
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.form.password) {
        callback(new Error('两次输入的密码不一致'));
      } else {
        callback();
      }
    };
    
    return {
      showPassword: false,
      form: {
        username: '',
        password: '',
        confirmPassword: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          { validator: validateConfirmPassword, trigger: 'blur' }
        ]
      }
    };
  },
  created() {
    // 获取当前用户信息
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      this.form.username = user.username;
      // 设置axios默认请求头
      this.$axios.defaults.headers.common['user-id'] = user.id;
    }
  },
  methods: {
    submitForm() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await this.$axios.put('/user/profile', {
              username: this.form.username,
              password: this.form.password
            }, {
              headers: {
                'user-id': user.id
              }
            });
            
            if (response.data.success) {
              // 更新本地存储的用户信息
              const user = JSON.parse(localStorage.getItem('user'));
              user.username = this.form.username;
              localStorage.setItem('user', JSON.stringify(user));
              
              this.$message.success('个人信息更新成功');
              this.resetForm();
            }
          } catch (error) {
            this.$message.error(error.response?.data?.message || '更新失败，请稍后重试');
          }
        }
      });
    },
    resetForm() {
      this.$refs.form.resetFields();
      // 重置后恢复当前用户名
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        this.form.username = user.username;
      }
    }
  }
};
</script>

<style scoped>
.profile-container {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
}

.profile-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #42b983;
  margin-bottom: 30px;
  text-align: center;
}

.show-password {
  cursor: pointer;
  color: #909399;
}

.show-password:hover {
  color: #409EFF;
}
</style> 