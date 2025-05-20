const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config.js');
const routes = require('./routes');

const app = express();

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use('/api', routes);

app.listen(config.port, () => {
  console.log(`后端服务运行在 http://10.29.110.212:${config.port}`);
});