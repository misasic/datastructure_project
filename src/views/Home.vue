<template>
  <div class="home">
    <h1>欢迎来到北邮导览</h1>
    <div class="feature-grid">
      <div class="feature-card" @click="$router.push('/diary')">
        <i class="el-icon-notebook-2"></i>
        <h2>日记管理</h2>
        <p>记录你的校园生活点滴</p>
      </div>
      <div class="feature-card" @click="$router.push('/map')">
        <i class="el-icon-map-location"></i>
        <h2>校园导航</h2>
        <p>探索校园的每个角落</p>
      </div>
      <div class="feature-card" @click="$router.push('/spots')">
        <i class="el-icon-place"></i>
        <h2>景点推荐</h2>
        <p>发现校园特色景点</p>
      </div>
      <div class="feature-card" @click="$router.push('/profile')">
        <i class="el-icon-user"></i>
        <h2>个人信息</h2>
        <p>管理您的账户信息</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  created() {
    // 检查是否已登录
    const user = localStorage.getItem('user');
    if (!user) {
      this.$router.push('/login');
    }
  }
}
</script>

<style scoped>
.home {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: #42b983;
  margin-bottom: 40px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
}

.feature-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card i {
  font-size: 48px;
  color: #42b983;
  margin-bottom: 15px;
}

.feature-card h2 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.feature-card p {
  color: #666;
}
</style> 