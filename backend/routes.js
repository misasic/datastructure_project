const express = require('express');
const router = express.Router();
const db = require('./db');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

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