import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Diary from '../views/Diary.vue'
import DiaryDetail from '../views/DiaryDetail.vue'
import DiaryCreate from '../views/DiaryCreate.vue'
import DiaryEdit from '../views/DiaryEdit.vue'
import Map from '../views/Map.vue'
import Recommendation from '../views/Recommendation.vue'
import SearchResults from '../views/SearchResults.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/diary',
    name: 'Diary',
    component: Diary,
    meta: { requiresAuth: true }
  },
  {
    path: '/diary/create',
    name: 'DiaryCreate',
    component: DiaryCreate,
    meta: { requiresAuth: true }
  },
  {
    path: '/diary/:id',
    name: 'DiaryDetail',
    component: DiaryDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/diary/edit/:id',
    name: 'DiaryEdit',
    component: DiaryEdit,
    meta: { requiresAuth: true }
  },
  {
    path: '/search',
    name: 'SearchResults',
    component: SearchResults,
    meta: { requiresAuth: true }
  },
  {
    path: '/map',
    name: 'Map',
    component: Map,
    meta: { requiresAuth: true }
  },
  {
    path: '/spots',
    name: 'Spots',
    component: Recommendation,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const user = localStorage.getItem('user')
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!user) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
