import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import AMap from '../views/Map.vue'
import Recommendation from '../views/Recommendation.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/map',
    name: 'AMap',
    component: AMap,
    meta: { requiresAuth: true }
  },
  {
    path: '/recommendation',
    name: 'Recommendation',
    component: Recommendation,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 导航守卫
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const isAuthenticated = localStorage.getItem('user') !== null
    if (!isAuthenticated) {
      next({ name: 'Login' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
