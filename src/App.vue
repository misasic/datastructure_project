<template>
  <div id="app">
    <!-- 全局导航栏（可选） -->
    <nav v-if="$route.path !== '/'">
      <button @click="handleLogout" class="logout-btn">退出登录</button>
    </nav>
    
    <!-- 路由出口 + 过渡效果 -->
    <transition name="fade" mode="out-in">
      <router-view />
    </transition>
  </div>
</template>

<script>
export default {
  name: 'App',
  methods: {
    handleLogout() {
      localStorage.removeItem('user');
      this.$router.push('/');
    }
  }
};
</script>

<style>
/* 过渡效果 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

/* 全局样式 */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

/* 导航栏样式 */
nav {
  padding: 10px;
  background: #42b983;
  display: flex;
  justify-content: flex-end;
}

.logout-btn {
  background: #f56c6c;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}
</style>