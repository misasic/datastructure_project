<template>
  <div class="login-page">
    <div class="background-image"></div>
    <div class="login-container">
      <h1 class="title">BUPTguider</h1>
      <p class="subtitle">世界那么大，我想去看看</p>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            required
            placeholder="请输入用户名"
            class="input-field"
          />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            placeholder="请输入密码"
            class="input-field"
          />
        </div>
        <div class="button-group">
          <button type="submit" :disabled="loading" class="login-button">
            {{ loading ? '登录中...' : '登录' }}
          </button>
          <button type="button" @click="handleRegister" :disabled="loading" class="register-button">
            注册
          </button>
        </div>
        <p v-if="error" class="error-message">{{ error }}</p>  
          </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: "LoginPage",
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      loading: false,
      error: ''
    };
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      this.error = '';
      
      try {
        const response = await axios.post(
          'http://10.29.110.212:3000/api/login',
          this.form
        );
        
        if (response.data.success) {
          localStorage.setItem('user', JSON.stringify({
            id: response.data.user.id,
            username: response.data.user.username
          }));
          this.$router.push('/map');
        } else {
          this.error = response.data.message || '登录失败，请检查凭证';
        }
      } catch (err) {
        this.error = this.getErrorMessage(err);
      } finally {
        this.loading = false;
      }
    },

    async handleRegister() {
      this.loading = true;
      this.error = '';
      
      try {
        const response = await axios.post(
          'http://10.29.110.212:3000/api/register',
          this.form
        );
        
        if (response.data.success) {
          this.error = '注册成功，请登录';
        } else {
          this.error = response.data.message || '注册失败';
        }
      } catch (err) {
        this.error = this.getErrorMessage(err);
      } finally {
        this.loading = false;
      }
    },

    getErrorMessage(err) {
      if (err.response) {
        switch (err.response.status) {
          case 400: return '此用户名已存在';
          case 401: return '用户名或密码错误';
          case 500: return '';
          default: return '网络请求失败';
        }
      }
      return '网络连接异常';
    }
  }
};
</script>

<style scoped>
.login-page {
  font-family: "SimSun", serif;
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.background-image {
  background-image: url('D:/HP/Desktop/datastruct/buptguider/buptguider/src/assets/moutains-8445767_1280.jpg');
  background-size: cover;
  background-position: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
}

.text-container {
  position: absolute;
  top: 30px;
  left: 30px;
  color: white;
}

.title {
  font-size: 48px;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 20px;
  color: #4c4848;
}

.login-container {
  max-width: 450px;
  position: absolute;
  top: 50%;
  right: 250px;
  transform: translateY(-50%); /* 垂直居中 */
  padding: 25px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.8); /* 半透明背景 */
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.title,
.subtitle {
  text-align: left;
}

.form-group {
  margin-bottom: 10px;
  text-align: left;
}

.input-field {
  width: 100%;
  padding: 15px;
  font-size: 18px;
  border-radius: 10px;
  border: 1px solid #ccc;
  outline: none;
  box-sizing: border-box;
  margin-bottom: 15px;
  background-color: rgba(255, 255, 255, 0.9); /* 更加柔和的输入框背景 */
}

.button-group {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.login-button,
.register-button {
  padding: 15px;
  background-color: #6c7a89;
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.login-button:hover,
.register-button:hover {
  background-color: #4d5a69;
}

.login-button:active,
.register-button:active {
  transform: scale(0.98); /* 按钮按下时有轻微缩放效果 */
}
</style>