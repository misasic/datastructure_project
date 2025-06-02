# buptguider

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## backend start 

node server.js

## 这个项目很多库文件都没有下，在自己的电脑启动记得先下库



#更新，新增日记模块功能，更改了数据库文件结构，
下面是用ai给出的启动指南：
# BUPTguider - 北邮导览系统

这是一个基于Vue 3和Node.js的校园导览系统，提供日记管理、校园导航、景点推荐等功能。

## 系统要求

- Node.js 16.0 或更高版本
- Python 3.8 或更高版本
- MySQL 8.0 或更高版本
- npm 或 yarn 包管理器

## 安装步骤

### 1. 克隆项目

```bash
git clone [项目地址]
cd datastructure_project
```

### 2. 安装前端依赖

```bash
# 安装前端依赖
npm install
```

### 3. 安装后端依赖

```bash
# 进入后端目录
cd backend

# 安装后端依赖
npm install

# 安装Python依赖
pip install -r requirements.txt
```

### 4. 配置数据库

1. 创建MySQL数据库
2. 导入数据库结构：
```bash
mysql -u your_username -p your_database_name < backend/create_tables.sql
还有 database补充图片表格，两个sql语句都要运行
```

### 5. 配置环境变量

在backend目录下创建config.js文件：
//写你的数据库信息，好对接
```javascript
module.exports = {
  db: {
    host: 'localhost',
    user: 'your_username',
    password: 'your_password',
    database: 'your_database_name'
  },
  serverPort: 3000
};
```

## 启动项目

### 1. 启动后端服务

```bash
# 在backend目录下
node server.js
```

### 2. 启动前端服务

```bash
# 在项目根目录下
npm run serve
```

## 访问项目

- 前端地址：http://localhost:8080
- 后端API地址：http://localhost:3000

## 主要功能

1. 用户管理
   - 用户注册
   - 用户登录
   - 个人信息管理

2. 日记管理
   - 创建日记
   - 编辑日记
   - 删除日记
   - 日记点赞
   - 图片上传
   - AI视频生成

3. 校园导航
   - 景点推荐
   - 路线规划
   - 地图显示

## 注意事项

1. 确保MySQL服务已启动
2. 确保所有依赖都已正确安装
3. 如果遇到端口占用问题，可以在配置文件中修改端口号
4. 首次运行需要导入数据库结构
5. 上传图片大小限制为2MB
6. AI视频生成功能需要安装Python依赖

## 常见问题

1. 如果遇到"Module not found"错误，请检查依赖是否正确安装
2. 如果数据库连接失败，请检查数据库配置是否正确
3. 如果图片上传失败，请检查文件大小是否超过限制
4. 如果AI视频生成失败，请确保已安装所有Python依赖
5.现在能够生成的图片只能是固定一张图片的程序，还需要优化，目前视频api没写在程序里，无法运行正常，但是本地可以正常运行
## 技术支持

如有问题，请提交Issue或联系项目维护者。
如果还有报错大概率是图片上传的问题，看看是不是有的图片上传文件夹不存在