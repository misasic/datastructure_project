const express = require('express');
const router = express.Router();
const db = require('./db');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const recommendation = require('./recommendation');

// 用户登录
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // 1. 查询用户是否存在
    const [user] = await db.query(
      'SELECT * FROM users WHERE username = ?', 
      [username]
    );
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: '用户名或密码错误' 
      });
    }
    
    // 2. 验证密码 (使用bcrypt比对哈希值)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: '用户名或密码错误' 
      });
    }
    
    // 3. 登录成功
    res.json({ 
      success: true, 
      user: {
        id: user.id,
        username: user.username
        // 不要返回密码字段
      }
    });
    
  } catch (err) {
    console.error('登录错误:', err);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误' 
    });
  }
});

// 用户注册
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // 1. 检查用户名是否存在
    const [existing] = await db.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: '用户名已存在' 
      });
    }
    
    // 2. 密码加密
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // 3. 创建用户
    const [result] = await db.query(
      'INSERT INTO users (username, password,showpassword) VALUES (?, ?, ?)',
      [username, hashedPassword,password]
    );
    
    res.json({ 
      success: true,
      message: '注册成功',
      userId: result.insertId
    });
    
  } catch (err) {
    console.error('注册错误:', err);
    res.status(500).json({ 
      success: false, 
      message: '注册失败' 
    });
  }
});

// 旅游推荐相关路由

// 获取景点推荐
router.get('/scenic-spots', async (req, res) => {
  try {
    const { 
      limit = 10, 
      sortBy = 'popularity', 
      category,
      keyword
    } = req.query;
    
    // 从请求头或会话中获取用户ID
    const userId = req.headers['user-id'] || null;
    
    const options = {
      userId: userId ? parseInt(userId) : null,
      limit: parseInt(limit),
      sortBy,
      category,
      keyword
    };
    
    const recommendations = await recommendation.getScenicSpotRecommendations(options);
    
    res.json({
      success: true,
      data: recommendations
    });
  } catch (err) {
    console.error('获取景点推荐出错:', err);
    res.status(500).json({
      success: false,
      message: '获取景点推荐失败'
    });
  }
});

// 获取学校推荐
router.get('/schools', async (req, res) => {
  try {
    const { 
      limit = 10, 
      sortBy = 'popularity', 
      category,
      keyword
    } = req.query;
    
    // 从请求头或会话中获取用户ID
    const userId = req.headers['user-id'] || null;
    
    const options = {
      userId: userId ? parseInt(userId) : null,
      limit: parseInt(limit),
      sortBy,
      category,
      keyword
    };
    
    const recommendations = await recommendation.getSchoolRecommendations(options);
    
    res.json({
      success: true,
      data: recommendations
    });
  } catch (err) {
    console.error('获取学校推荐出错:', err);
    res.status(500).json({
      success: false,
      message: '获取学校推荐失败'
    });
  }
});

// 设置用户偏好
router.post('/user-preference', async (req, res) => {
  try {
    const { userId, category, interestLevel } = req.body;
    
    if (!userId || !category || interestLevel === undefined) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }
    
    const result = await recommendation.setUserPreference(
      parseInt(userId),
      category,
      parseFloat(interestLevel)
    );
    
    res.json({
      success: true,
      message: '用户偏好设置成功'
    });
  } catch (err) {
    console.error('设置用户偏好出错:', err);
    res.status(500).json({
      success: false,
      message: '设置用户偏好失败'
    });
  }
});

// 获取所有景点分类
router.get('/scenic-spot-categories', async (req, res) => {
  try {
    const categories = await db.query(
      'SELECT DISTINCT category FROM scenic_spots'
    );
    
    res.json({
      success: true,
      data: categories.map(item => item.category)
    });
  } catch (err) {
    console.error('获取景点分类出错:', err);
    res.status(500).json({
      success: false,
      message: '获取景点分类失败'
    });
  }
});

// 获取所有学校分类
router.get('/school-categories', async (req, res) => {
  try {
    const categories = await db.query(
      'SELECT DISTINCT category FROM schools'
    );
    
    res.json({
      success: true,
      data: categories.map(item => item.category)
    });
  } catch (err) {
    console.error('获取学校分类出错:', err);
    res.status(500).json({
      success: false,
      message: '获取学校分类失败'
    });
  }
});

// 添加或更新景点
router.post('/scenic-spot', async (req, res) => {
  try {
    const { 
      id, name, category, description, 
      location, image_url, popularity, 
      rating, keywords 
    } = req.body;
    
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: '景点名称和分类为必填项'
      });
    }
    
    if (id) {
      // 更新景点
      await db.query(
        `UPDATE scenic_spots SET 
         name = ?, category = ?, description = ?,
         location = ?, image_url = ?, popularity = ?,
         rating = ?, keywords = ?
         WHERE id = ?`,
        [name, category, description, location, 
         image_url, popularity || 0, rating || 0, 
         keywords, id]
      );
      
      res.json({
        success: true,
        message: '景点更新成功',
        id
      });
    } else {
      // 新增景点
      const [result] = await db.query(
        `INSERT INTO scenic_spots 
         (name, category, description, location, 
          image_url, popularity, rating, keywords)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, category, description, location, 
         image_url, popularity || 0, rating || 0, 
         keywords]
      );
      
      res.json({
        success: true,
        message: '景点添加成功',
        id: result.insertId
      });
    }
  } catch (err) {
    console.error('添加/更新景点出错:', err);
    res.status(500).json({
      success: false,
      message: '添加/更新景点失败'
    });
  }
});

// 添加或更新学校
router.post('/school', async (req, res) => {
  try {
    const { 
      id, name, category, description, 
      location, image_url, popularity, 
      rating, keywords 
    } = req.body;
    
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: '学校名称和分类为必填项'
      });
    }
    
    if (id) {
      // 更新学校
      await db.query(
        `UPDATE schools SET 
         name = ?, category = ?, description = ?,
         location = ?, image_url = ?, popularity = ?,
         rating = ?, keywords = ?
         WHERE id = ?`,
        [name, category, description, location, 
         image_url, popularity || 0, rating || 0, 
         keywords, id]
      );
      
      res.json({
        success: true,
        message: '学校更新成功',
        id
      });
    } else {
      // 新增学校
      const [result] = await db.query(
        `INSERT INTO schools 
         (name, category, description, location, 
          image_url, popularity, rating, keywords)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, category, description, location, 
         image_url, popularity || 0, rating || 0, 
         keywords]
      );
      
      res.json({
        success: true,
        message: '学校添加成功',
        id: result.insertId
      });
    }
  } catch (err) {
    console.error('添加/更新学校出错:', err);
    res.status(500).json({
      success: false,
      message: '添加/更新学校失败'
    });
  }
});

// 数据库连接测试
router.get('/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS solution');
    res.json({ 
      success: true, 
      data: rows 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

module.exports = router;