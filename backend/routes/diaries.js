const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取用户的所有日记
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    console.log(`[${new Date().toISOString()}] 获取日记列表 - 用户ID:`, userId);

    if (!userId) {
      console.log('未提供用户ID');
      return res.status(401).json({
        success: false,
        message: '请先登录后再查看日记'
      });
    }

    const result = await db.query(
      'SELECT id, user_id, title, content, date, created_at, updated_at FROM diaries WHERE user_id = ? ORDER BY date DESC, id DESC',
      [userId]
    );

    console.log(`[${new Date().toISOString()}] 查询结果:`, result);

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] 获取日记列表失败:`, err);
    res.status(500).json({
      success: false,
      message: '获取日记列表失败，请稍后重试'
    });
  }
});

// 获取热门日记
router.get('/popular', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT d.id, d.user_id, d.title, d.content, d.date, d.created_at, d.updated_at,
              d.views, d.likes, u.username as author
       FROM diaries d
       JOIN users u ON d.user_id = u.id
       ORDER BY d.views DESC, d.likes DESC
       LIMIT 10`
    );
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: '获取热门日记失败' });
  }
});

// 获取最多点赞的日记
router.get('/most-liked', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT d.id, d.user_id, d.title, d.content, d.date, d.created_at, d.updated_at,
              d.views, d.likes, u.username as author
       FROM diaries d
       JOIN users u ON d.user_id = u.id
       ORDER BY d.likes DESC, d.views DESC
       LIMIT 10`
    );
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: '获取最多点赞日记失败' });
  }
});

// 搜索日记
router.get('/search', async (req, res) => {
  try {
    const { keyword } = req.query;
    const result = await db.query(
      `SELECT d.id, d.user_id, d.title, d.content, d.date, d.created_at, d.updated_at,
              d.views, d.likes, u.username as author
       FROM diaries d
       JOIN users u ON d.user_id = u.id
       WHERE d.title LIKE ? OR d.content LIKE ?
       ORDER BY d.date DESC, d.id DESC`,
      [`%${keyword}%`, `%${keyword}%`]
    );
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: '搜索日记失败' });
  }
});

// 创建新日记
router.post('/', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const { title, content } = req.body;
    
    console.log(`[${new Date().toISOString()}] 创建日记 - 用户ID:`, userId);
    console.log('日记标题:', title);
    console.log('日记内容长度:', content ? content.length : 0);

    if (!userId) {
      console.log('未提供用户ID');
      return res.status(401).json({
        success: false,
        message: '请先登录后再创建日记'
      });
    }

    if (!title) {
      console.log('日记标题为空');
      return res.status(400).json({
        success: false,
        message: '日记标题不能为空'
      });
    }

    if (!content) {
      console.log('日记内容为空');
      return res.status(400).json({
        success: false,
        message: '日记内容不能为空'
      });
    }

    // 开始事务
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // 插入新日记
      const [result] = await connection.query(
        'INSERT INTO diaries (user_id, title, content, date) VALUES (?, ?, ?, NOW())',
        [userId, title, content]
      );

      console.log('插入结果:', result);

      // 检查插入结果
      if (!result || result.affectedRows !== 1) {
        throw new Error('创建日记失败，无法确认插入是否成功');
      }

      const insertId = result.insertId;
      console.log('新创建的日记ID:', insertId);

      // 查询新创建的日记
      const [diaryRows] = await connection.query(
        'SELECT * FROM diaries WHERE id = ?',
        [insertId]
      );

      console.log('查询新创建的日记:', diaryRows);

      if (!diaryRows || diaryRows.length === 0) {
        throw new Error('无法获取新创建的日记');
      }

      // 提交事务
      await connection.commit();

      // 返回成功响应
      res.json({
        success: true,
        message: '日记创建成功',
        data: diaryRows[0]
      });
    } catch (err) {
      // 回滚事务
      await connection.rollback();
      throw err;
    } finally {
      // 释放连接
      connection.release();
    }
  } catch (err) {
    console.error(`[${new Date().toISOString()}] 创建日记失败:`, err);
    
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({
        success: false,
        message: '日记已存在，请勿重复创建'
      });
    } else if (err.code === 'ER_NO_REFERENCED_ROW') {
      res.status(400).json({
        success: false,
        message: '用户信息无效，请重新登录'
      });
    } else {
      res.status(500).json({
        success: false,
        message: err.message || '创建日记失败，请稍后重试'
      });
    }
  }
});

module.exports = router; 