const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: '0.0.0.0', // 允许从任何 IP 地址访问
    port: 3000, // 端口号
    allowedHosts: 'all', // 允许所有主机访问
    // 其他配置...
  }
});