const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: '0.0.0.0', // 允许从任何 IP 地址访问
    port: 8080, // 修改端口号为8080
    allowedHosts: 'all', // 允许所有主机访问
    proxy: {
      '^/diaries': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        pathRewrite: {
          '^/diaries': '/api/diaries'
        }
      },
      '^/images': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        pathRewrite: {
          '^/images': '/api/images'
        }
      }
    }
    // 其他配置...
  }
});