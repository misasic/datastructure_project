import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'

// 动态设置API地址，支持外网访问
const hostname = window.location.hostname;
const apiPort = 3000;
axios.defaults.baseURL = `http://${hostname}:${apiPort}/api`;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.timeout = 10000; // 10秒超时
axios.defaults.retry = 3; // 最多重试3次
axios.defaults.retryDelay = 1000; // 重试间隔1秒

// 添加请求拦截器打印请求URL和参数
axios.interceptors.request.use(function (config) {
  console.log('请求URL:', config.url);
  console.log('请求方法:', config.method);
  console.log('请求参数:', config.params || config.data);
  console.log('完整请求URL:', axios.defaults.baseURL + config.url);
  return config;
}, function (error) {
  return Promise.reject(error);
});

// 添加响应拦截器打印响应结果
axios.interceptors.response.use(function (response) {
  console.log('响应状态:', response.status);
  console.log('响应数据:', response.data);
  return response;
}, function (error) {
  console.error('请求错误:', error);
  
  // 处理超时和网络错误的重试逻辑
  const config = error.config;
  // 如果配置不存在或者没有设置重试选项，直接返回错误
  if (!config || !config.retry) return Promise.reject(error);
  
  // 设置重试计数器
  config.__retryCount = config.__retryCount || 0;
  
  // 检查是否已经达到最大重试次数
  if (config.__retryCount >= config.retry) {
    return Promise.reject(error);
  }
  
  // 增加重试计数
  config.__retryCount += 1;
  console.log(`重试请求: 第${config.__retryCount}次，URL: ${config.url}`);
  
  // 创建新的Promise来处理重试延迟
  const backoff = new Promise(function(resolve) {
    setTimeout(function() {
      resolve();
    }, config.retryDelay || 1);
  });
  
  // 返回重试请求的Promise
  return backoff.then(function() {
    return axios(config);
  });
});

const app = createApp(App)

app.use(router)
app.mount('#app')