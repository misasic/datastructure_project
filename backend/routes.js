const express = require('express');
const router = express.Router();
const db = require('./db');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const recommendation = require('./recommendation');
const path = require('path');
const fs = require('fs');

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
      },
      token: 'dummy-token' // 这里可以添加真实的JWT token
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
    const existingUsers = await db.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: '用户名已存在' 
      });
    }
    
    // 2. 密码加密
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // 3. 创建用户
    const result = await db.query(
      'INSERT INTO users (username, password, showpassword) VALUES (?, ?, ?)',
      [username, hashedPassword, password]
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
    
    await recommendation.setUserPreference(
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

// 日记相关路由
// 获取所有日记
router.get('/diaries/all', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    console.log('获取所有日记 - 用户ID:', userId);

    if (!userId) {
      console.log('未提供用户ID');
      return res.status(401).json({
        success: false,
        message: '请先登录后再查看日记'
      });
    }

    const result = await db.query(
      `SELECT d.id, d.title, d.views, d.likes, d.updated_at, u.username as author
       FROM diaries d
       JOIN users u ON d.user_id = u.id
       ORDER BY d.updated_at DESC`
    );

    console.log('查询结果数量:', result.length);

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('获取所有日记失败:', err);
    res.status(500).json({
      success: false,
      message: '获取所有日记失败，请稍后重试'
    });
  }
});

// 获取用户的所有日记
router.get('/diaries', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    console.log('获取日记列表 - 用户ID:', userId);

    if (!userId) {
      console.log('未提供用户ID');
      return res.status(401).json({
        success: false,
        message: '请先登录后再查看日记'
      });
    }

    const result = await db.query(
      `SELECT d.id, d.title, d.content, d.date, d.created_at, d.updated_at, 
              d.views, d.likes, u.username as author
       FROM diaries d
       LEFT JOIN users u ON d.user_id = u.id
       WHERE d.user_id = ? 
       ORDER BY d.date DESC, d.id DESC`,
      [userId]
    );

    console.log('查询结果:', result);

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('获取日记列表失败:', err);
    res.status(500).json({
      success: false,
      message: '获取日记列表失败，请稍后重试'
    });
  }
});

// 获取热门日记（按浏览量）
router.get('/diaries/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const result = await db.query(
      `SELECT d.id, d.title, d.views, d.likes, d.updated_at, u.username as author
       FROM diaries d
       JOIN users u ON d.user_id = u.id
       ORDER BY d.views DESC, d.updated_at DESC
       LIMIT ?`,
      [parseInt(limit)]
    );
    
    console.log('热门日记查询结果:', result);
    
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('获取热门日记失败:', err);
    res.status(500).json({
      success: false,
      message: '获取热门日记失败'
    });
  }
});

// 获取最受欢迎日记（按点赞数）
router.get('/diaries/most-liked', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const result = await db.query(
      `SELECT d.id, d.title, d.views, d.likes, d.updated_at, u.username as author
       FROM diaries d
       JOIN users u ON d.user_id = u.id
       ORDER BY d.likes DESC, d.updated_at DESC
       LIMIT ?`,
      [parseInt(limit)]
    );
    
    console.log('最受欢迎日记查询结果:', result);
    
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('获取最受欢迎日记失败:', err);
    res.status(500).json({
      success: false,
      message: '获取最受欢迎日记失败'
    });
  }
});

// 搜索日记
router.get('/diaries/search', async (req, res) => {
  try {
    const { keyword, type = 'title', sortBy = 'views' } = req.query;
    
    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: '搜索关键词不能为空'
      });
    }
    
    let query;
    let params;
    
    // 构建基础查询
    const baseQuery = `
      SELECT DISTINCT d.id, d.title, d.content, d.views, d.likes, d.updated_at, u.username as author
      FROM diaries d
      JOIN users u ON d.user_id = u.id
      WHERE `;
    
    // 根据搜索类型构建不同的查询条件
    if (type === 'title') {
      query = baseQuery + `d.title LIKE ?`;
      params = [`%${keyword}%`];
    } else if (type === 'content') {
      query = baseQuery + `d.content LIKE ?`;
      params = [`%${keyword}%`];
    } else if (type === 'all') {
      query = baseQuery + `(d.title LIKE ? OR d.content LIKE ?)`;
      params = [`%${keyword}%`, `%${keyword}%`];
    }
    
    // 添加排序条件
    switch (sortBy) {
      case 'views':
        query += ' ORDER BY d.views DESC, d.updated_at DESC';
        break;
      case 'likes':
        query += ' ORDER BY d.likes DESC, d.updated_at DESC';
        break;
      case 'time':
        query += ' ORDER BY d.updated_at DESC, d.views DESC';
        break;
      default:
        query += ' ORDER BY d.views DESC, d.updated_at DESC';
    }
    
    console.log('执行搜索查询:', query);
    console.log('查询参数:', params);
    console.log('排序方式:', sortBy);
    
    // 使用query方法获取所有记录
    const result = await db.query(query, params);
    console.log('原始查询结果:', result);
    console.log('查询结果类型:', typeof result);
    console.log('是否为数组:', Array.isArray(result));
    console.log('结果长度:', result.length);
    console.log('具体内容:', JSON.stringify(result, null, 2));
    
    // 处理每条日记的基本信息
    const processedResults = result.map(diary => ({
      id: diary.id,
      title: diary.title,
      content: diary.content,
      views: parseInt(diary.views) || 0,
      likes: parseInt(diary.likes) || 0,
      updated_at: diary.updated_at,
      author: diary.author
    }));
    
    console.log('最终返回的数据:', processedResults);
    
    // 设置响应头，禁用缓存
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.json({
      success: true,
      data: processedResults
    });
  } catch (err) {
    console.error('搜索日记失败:', err);
    res.status(500).json({
      success: false,
      message: '搜索日记失败'
    });
  }
});

// 获取日记详情
router.get('/diaries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['user-id'];
    
    console.log('获取日记详情 - 日记ID:', id, '用户ID:', userId);
    
    // 增加浏览量
    await db.query(
      'UPDATE diaries SET views = views + 1 WHERE id = ?',
      [id]
    );
    
    // 获取日记详情
    const [diaries] = await db.query(
      `SELECT 
        d.id, d.title, d.compressed_content, d.content_original_size, d.content_compressed_size, d.content_compression_ratio, d.views, d.likes, d.date, d.created_at, d.updated_at, d.content_compressed,
        u.username as author,
        (SELECT COUNT(*) FROM diary_likes WHERE diary_id = d.id AND user_id = ?) as is_liked
       FROM diaries d
       LEFT JOIN users u ON d.user_id = u.id
       WHERE d.id = ?`,
      [userId, id]
    );
    
    console.log('查询到的日记详情:', JSON.stringify(diaries, null, 2));
    
    // 检查查询结果
    if (!diaries) {
      console.log('未找到日记');
      return res.status(404).json({
        success: false,
        message: '日记不存在'
      });
    }

    // 解压内容
    let compressed = diaries.compressed_content;
    if (Buffer.isBuffer(compressed)) {
      compressed = compressed.toString('utf8');
    }
    let content = lz77Decompress(compressed || '');

    // 获取日记图片
    const imagesSql = `SELECT * FROM diary_images WHERE diary_id = ? ORDER BY created_at ASC`;
    console.log('执行SQL查询:', imagesSql);
    console.log('查询参数:', [id]);
    
    const images = await db.query(imagesSql, [id]);
    console.log('SQL查询原始结果:', images);
    console.log('查询结果类型:', typeof images);
    console.log('是否为数组:', Array.isArray(images));
    console.log('结果长度:', images ? images.length : 0);

    // 确保images是数组，并且处理可能的null值
    let imageArray = [];
    if (images && images.length > 0) {
      imageArray = images.map(img => ({
        id: img.id,
        image_url: img.image_url,
        animation_url: img.animation_url || null,
        created_at: img.created_at
      }));
    }

    console.log('处理后的图片数组:', JSON.stringify(imageArray, null, 2));
    console.log('处理后的图片数组长度:', imageArray.length);

    // 构建日记对象
    const diary = {
      id: diaries.id || null,
      title: diaries.title || '无标题',
      content: content || '暂无内容',
      compressed_content: diaries.compressed_content || '',
      content_original_size: diaries.content_original_size || 0,
      content_compressed_size: diaries.content_compressed_size || 0,
      content_compression_ratio: diaries.content_compression_ratio ?? 0,
      views: parseInt(diaries.views) || 0,
      likes: parseInt(diaries.likes) || 0,
      date: diaries.date || null,
      created_at: diaries.created_at || null,
      updated_at: diaries.updated_at || null,
      author: diaries.author || '未知作者',
      is_liked: parseInt(diaries.is_liked) || 0,
      content_compressed: diaries.content_compressed || false,
      images: imageArray
    };
    
    console.log('最终返回的日记对象:', JSON.stringify(diary, null, 2));
    
    // 设置响应头，禁用缓存
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    return res.json({
      success: true,
      data: diary
    });
  } catch (err) {
    console.error('获取日记详情失败:', err);
    console.error('错误堆栈:', err.stack);
    console.error('错误类型:', err.constructor.name);
    console.error('错误消息:', err.message);
    return res.status(500).json({
      success: false,
      message: '获取日记详情失败'
    });
  }
});

// 创建新日记
router.post('/diaries', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '请先登录后再创建日记'
      });
    }

    const { title, content } = req.body;
    if (!title) {
      return res.status(400).json({
        success: false,
        message: '日记标题不能为空'
      });
    }
    if (!content) {
      return res.status(400).json({
        success: false,
        message: '日记内容不能为空'
      });
    }

    // 计算压缩相关信息
    const originalSize = Buffer.byteLength(content, 'utf8');
    const compressedContent = lz77Compress(content);
    const compressedSize = Buffer.byteLength(compressedContent, 'utf8');
    const compressionRatio = originalSize > 0 ? Math.round((1 - compressedSize / originalSize) * 100) : 0;

    // 使用事务处理创建日记
    const result = await db.transaction(async (connection) => {
      // 插入新日记，添加views和likes的默认值
      const [insertResult] = await connection.query(
        'INSERT INTO diaries (user_id, title, content, compressed_content, content_original_size, content_compressed_size, content_compression_ratio, content_compressed, date, views, likes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 0, 0)',
        [userId, title, content, compressedContent, originalSize, compressedSize, compressionRatio, true]
      );

      if (!insertResult || insertResult.affectedRows !== 1) {
        throw new Error('创建日记失败，无法确认插入是否成功');
      }

      const insertId = insertResult.insertId;

      // 查询新创建的日记
      const [diaryRows] = await connection.query(
        'SELECT * FROM diaries WHERE id = ?',
        [insertId]
      );

      if (!diaryRows || diaryRows.length === 0) {
        throw new Error('无法获取新创建的日记');
      }

      return diaryRows[0];
    });

    res.json({
      success: true,
      message: '日记创建成功',
      data: result
    });
  } catch (err) {
    console.error('创建日记失败:', err);
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

// 更新日记
router.put('/diaries/:id', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '请先登录后再修改日记'
      });
    }

    const { id } = req.params;
    const { title, content } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: '日记标题不能为空'
      });
    }
    if (!content) {
      return res.status(400).json({
        success: false,
        message: '日记内容不能为空'
      });
    }

    // 检查日记是否存在且属于当前用户
    const [diaryRows] = await db.query(
      'SELECT * FROM diaries WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (diaryRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '日记不存在或无权修改'
      });
    }

    // 计算压缩相关信息
    const originalSize = Buffer.byteLength(content, 'utf8');
    const compressedContent = lz77Compress(content);
    const compressedSize = Buffer.byteLength(compressedContent, 'utf8');
    const compressionRatio = originalSize > 0 ? Math.round((1 - compressedSize / originalSize) * 100) : 0;

    // 执行更新
    await db.query(
      'UPDATE diaries SET title = ?, content = ?, compressed_content = ?, content_original_size = ?, content_compressed_size = ?, content_compression_ratio = ?, content_compressed = ? WHERE id = ? AND user_id = ?',
      [title, content, compressedContent, originalSize, compressedSize, compressionRatio, true, id, userId]
    );

    res.json({
      success: true,
      message: '日记更新成功'
    });
  } catch (err) {
    console.error('更新日记失败:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({
        success: false,
        message: '更新失败，日记标题已存在'
      });
    } else {
      res.status(500).json({
        success: false,
        message: '更新日记失败，请稍后重试'
      });
    }
  }
});

// 删除日记
router.delete('/diaries/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.headers['user-id'];

  try {
    // 获取日记的所有图片
    const [images] = await db.query(
      'SELECT image_url, animation_url FROM diary_images WHERE diary_id = ?',
      [id]
    );

    // 删除相关的视频文件
    if (images && Array.isArray(images)) {
      for (const image of images) {
        if (image.animation_url) {
          const videoPath = path.join(__dirname, 'public', image.animation_url);
          if (fs.existsSync(videoPath)) {
            fs.unlinkSync(videoPath);
          }
        }
      }
    }

    // 删除日记记录
    await db.query('DELETE FROM diaries WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: '日记删除成功' });
  } catch (error) {
    console.error('删除日记失败:', error);
    res.status(500).json({ message: '删除日记失败' });
  }
});

// 生成AIGC视频
router.post('/diaries/:id/generate-aigc-video', async (req, res) => {
  const { id } = req.params;
  const userId = req.headers['user-id'];
  const { prompt, resolution = '720P', duration = 5, prompt_extend = true } = req.body;

  try {
    // 验证日记所有权
    const [diary] = await db.query(
      'SELECT * FROM diaries WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!diary) {
      return res.status(404).json({ message: '日记不存在或无权访问' });
    }

    // 获取日记的所有图片
    const [imagesRaw] = await db.query(
      'SELECT image_url FROM diary_images WHERE diary_id = ?',
      [id]
    );
    const images = Array.isArray(imagesRaw) ? imagesRaw : [imagesRaw];
    if (!images || images.length === 0 || !images[0].image_url) {
      return res.status(400).json({ success: false, message: '请先上传图片' });
    }
    // 只取第一张图片的公网URL
    let imageUrl = images[0].image_url;
    if (!/^https?:\/\//.test(imageUrl)) {
      // 使用完整的公网URL
      imageUrl = `http://localhost:3000${imageUrl}`;
      console.log('使用公网URL:', imageUrl);
    }

    // 生成输出视频路径
    const outputVideoPath = path.join(__dirname, 'public', 'videos', `aigc_video_${id}_${Date.now()}.mp4`);
    
    // 确保输出目录存在
    const outputDir = path.dirname(outputVideoPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log('开始调用Python脚本生成视频...');
    console.log('图片URL:', imageUrl);
    console.log('输出路径:', outputVideoPath);

    // 调用Python脚本
    const pythonProcess = require('child_process').spawn('python', [
      path.join(__dirname, 'generate_video_aliyun.py'),
      '--image_url', imageUrl,
      '--prompt', prompt || '生成一个流畅的视频',
      '--output_path', outputVideoPath,
      '--resolution', resolution,
      '--duration', duration.toString(),
      '--prompt_extend', prompt_extend.toString()
    ]);

    let stderr = '';
    pythonProcess.stdout.on('data', (data) => {
      console.log('Python输出:', data.toString());
    });
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pythonProcess.on('close', async (code) => {
      if (code === 0) {
        // 更新数据库中的视频URL
        const videoUrl = `/videos/${path.basename(outputVideoPath)}`;
        await db.query(
          'UPDATE diary_images SET animation_url = ? WHERE diary_id = ?',
          [videoUrl, id]
        );
        res.json({
          success: true,
          message: '视频生成成功',
          videoUrl: videoUrl
        });
      } else {
        res.status(500).json({
          success: false,
          message: '生成视频失败: ' + stderr
        });
      }
    });
  } catch (error) {
    console.error('生成视频失败:', error);
    res.status(500).json({
      success: false,
      message: '生成视频失败: ' + error.message
    });
  }
});

// 删除AIGC视频
router.delete('/diaries/:id/aigc-video', async (req, res) => {
  const { id } = req.params;
  const userId = req.headers['user-id'];

  try {
    // 验证日记所有权
    const [diary] = await db.query(
      'SELECT * FROM diaries WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!diary) {
      return res.status(404).json({ message: '日记不存在或无权访问' });
    }

    // 获取视频URL
    const [images] = await db.query(
      'SELECT animation_url FROM diary_images WHERE diary_id = ? AND animation_url IS NOT NULL',
      [id]
    );

    if (images && images.length > 0) {
      const videoPath = path.join(__dirname, 'public', images[0].animation_url);
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }

      // 清除数据库中的视频URL
      await db.query(
        'UPDATE diary_images SET animation_url = NULL WHERE diary_id = ?',
        [id]
      );
    }

    res.json({ message: '视频删除成功' });
  } catch (error) {
    console.error('删除视频失败:', error);
    res.status(500).json({ message: '删除视频失败' });
  }
});

// LZ77压缩算法实现
function lz77Compress(text) {
  const windowSize = 4096; // 滑动窗口大小
  const lookAheadSize = 64; // 前瞻缓冲区大小
  let result = [];
  let pos = 0;

  while (pos < text.length) {
    let bestMatch = { length: 0, offset: 0 };

    // 在滑动窗口中寻找最长匹配
    for (let offset = 1; offset <= Math.min(windowSize, pos); offset++) {
      let length = 0;
      while (
        length < lookAheadSize &&
        pos + length < text.length &&
        text[pos - offset + length] === text[pos + length]
      ) {
        length++;
      }

      if (length > bestMatch.length) {
        bestMatch = { length, offset };
      }
    }

    if (bestMatch.length > 3) { // 只有当匹配长度大于3时才使用引用
      result.push(`<${bestMatch.offset},${bestMatch.length}>`);
      pos += bestMatch.length;
    } else {
      result.push(text[pos]);
      pos++;
    }
  }

  return result.join('');
}

// LZ77解压缩算法实现
function lz77Decompress(compressed) {
  let result = '';
  let pos = 0;

  while (pos < compressed.length) {
    if (compressed[pos] === '<') {
      // 解析引用
      const end = compressed.indexOf('>', pos);
      if (end === -1) break;
      
      const [offset, length] = compressed.slice(pos + 1, end).split(',').map(Number);
      const start = result.length - offset;
      
      for (let i = 0; i < length; i++) {
        result += result[start + i];
      }
      
      pos = end + 1;
    } else {
      // 直接复制字符
      result += compressed[pos];
      pos++;
    }
  }

  return result;
}

// 上传图片
router.post('/images/upload', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '请先登录'
      });
    }

    // 检查是否有文件上传
    if (!req.files || !req.files.image) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的图片'
      });
    }

    const file = req.files.image;
    console.log('上传的文件信息:', file);
    
    // 检查文件类型
    if (!file.mimetype.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        message: '只能上传图片文件'
      });
    }

    // 检查文件大小（限制为2MB）
    if (file.size > 2 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: '图片大小不能超过2MB'
      });
    }

    // 生成文件名
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    
    // 确保上传目录存在
    const uploadDir = path.join(__dirname, '../public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 保存文件
    const filePath = path.join(uploadDir, fileName);
    await file.mv(filePath);

    // 返回文件URL
    const imageUrl = `/uploads/${fileName}`;
    
    console.log('文件上传成功:', {
      fileName,
      filePath,
      imageUrl
    });
    
    res.json({
      success: true,
      message: '图片上传成功',
      data: {
        image_url: imageUrl
      }
    });
  } catch (err) {
    console.error('上传图片失败:', err);
    res.status(500).json({
      success: false,
      message: '上传图片失败：' + err.message
    });
  }
});

// 获取日记的所有图片
router.get('/diaries/:id/images', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('获取日记图片 - 日记ID:', id);

    // 直接查询所有图片
    const [images] = await db.query(
      `SELECT * FROM diary_images WHERE diary_id = ? ORDER BY created_at ASC`,
      [id]
    );

    // 确保返回的是数组
    const imageArray = Array.isArray(images) ? images : [];

    console.log('数据库查询结果:', imageArray);
    console.log('查询结果类型:', typeof imageArray);
    console.log('是否为数组:', Array.isArray(imageArray));
    console.log('结果长度:', imageArray.length);

    res.json({
      success: true,
      data: imageArray
    });
  } catch (err) {
    console.error('获取日记图片失败:', err);
    res.status(500).json({
      success: false,
      message: '获取日记图片失败'
    });
  }
});

// 获取日记的所有图片（详细调试用）
router.get('/diaries/:id/images/debug-db', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('详细调试 - 获取日记图片 - 日记ID:', id);

    // 1. 首先检查日记是否存在
    const diarySql = 'SELECT id, title FROM diaries WHERE id = ?';
    console.log('执行日记查询SQL:', diarySql);
    console.log('日记查询参数:', [id]);
    
    const diary = await db.query(diarySql, [id]);
    console.log('日记信息:', diary);

    // 2. 查询所有图片
    const imagesSql = `SELECT * FROM diary_images WHERE diary_id = ? ORDER BY created_at ASC`;
    console.log('执行图片查询SQL:', imagesSql);
    console.log('图片查询参数:', [id]);
    
    const images = await db.query(imagesSql, [id]);
    console.log('图片查询原始结果:', images);
    console.log('查询结果类型:', typeof images);
    console.log('是否为数组:', Array.isArray(images));
    console.log('结果长度:', images ? images.length : 0);

    res.json({
      success: true,
      data: images || []
    });
  } catch (err) {
    console.error('获取日记图片失败:', err);
    res.status(500).json({
      success: false,
      message: '获取日记图片失败'
    });
  }
});

// 删除图片动画
router.delete('/diaries/:id/images/:image_id/animation', async (req, res) => {
  try {
    const { id, image_id } = req.params;
    const userId = req.headers['user-id'];
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '请先登录'
      });
    }

    // 获取图片信息
    const [image] = await db.query(
      'SELECT * FROM diary_images WHERE id = ? AND diary_id = ?',
      [image_id, id]
    );

    if (!image) {
      return res.status(404).json({
        success: false,
        message: '图片不存在'
      });
    }

    // 如果存在动画文件，删除它
    if (image.animation_url) {
      const animationPath = path.join(__dirname, '../public', image.animation_url);
      if (fs.existsSync(animationPath)) {
        fs.unlinkSync(animationPath);
      }
    }

    // 更新数据库，清除动画URL
    await db.query(
      'UPDATE diary_images SET animation_url = NULL WHERE id = ?',
      [image_id]
    );

    res.json({
      success: true,
      message: '动画删除成功'
    });
  } catch (err) {
    console.error('删除动画失败:', err);
    res.status(500).json({
      success: false,
      message: '删除动画失败：' + err.message
    });
  }
});

// 更新用户个人信息
router.put('/user/profile', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '请先登录'
      });
    }

    const { username, password } = req.body;

    // 检查用户名是否已存在
    if (username) {
      const [existingUser] = await db.query(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, userId]
      );

      if (existingUser && existingUser.length > 0) {
        return res.status(400).json({
          success: false,
          message: '用户名已存在'
        });
      }
    }

    // 准备更新数据
    let updateFields = [];
    let params = [];

    if (username) {
      updateFields.push('username = ?');
      params.push(username);
    }

    if (password) {
      // 密码加密
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateFields.push('password = ?');
      params.push(hashedPassword);
      
      // 同时更新showpassword字段为明文密码
      updateFields.push('showpassword = ?');
      params.push(password);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有要更新的信息'
      });
    }

    // 添加用户ID到参数数组
    params.push(userId);

    // 打印更新语句和参数
    console.log('更新SQL:', `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`);
    console.log('更新参数:', params);

    // 执行更新
    const [result] = await db.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    console.log('更新结果:', result);

    // 验证更新是否成功
    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: '更新失败，用户不存在'
      });
    }

    res.json({
      success: true,
      message: '个人信息更新成功'
    });
  } catch (err) {
    console.error('更新个人信息失败:', err);
    res.status(500).json({
      success: false,
      message: '更新个人信息失败'
    });
  }
});

// 添加日记图片
router.post('/diaries/:id/images', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['user-id'];
    const { image_url } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '请先登录'
      });
    }

    // 验证日记所有权
    const [diary] = await db.query(
      'SELECT * FROM diaries WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!diary || diary.length === 0) {
      return res.status(404).json({
        success: false,
        message: '日记不存在或无权操作'
      });
    }

    // 添加图片
    const [result] = await db.query(
      'INSERT INTO diary_images (diary_id, image_url) VALUES (?, ?)',
      [id, image_url]
    );

    res.json({
      success: true,
      message: '图片添加成功',
      data: {
        id: result.insertId,
        image_url
      }
    });
  } catch (err) {
    console.error('添加日记图片失败:', err);
    res.status(500).json({
      success: false,
      message: '添加日记图片失败'
    });
  }
});

// 日记点赞
router.post('/diaries/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['user-id'];

    console.log('点赞操作 - 日记ID:', id, '用户ID:', userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '请先登录'
      });
    }
    
    // 使用事务确保数据一致性
    const result = await db.transaction(async (connection) => {
      // 检查日记是否存在
      const [diary] = await connection.query(
        'SELECT id FROM diaries WHERE id = ?',
        [id]
      );

      if (!diary || diary.length === 0) {
        throw new Error('日记不存在');
      }

      // 检查是否已经点赞
      const [existingLike] = await connection.query(
        'SELECT id FROM diary_likes WHERE diary_id = ? AND user_id = ?',
        [id, userId]
      );

      if (existingLike && existingLike.length > 0) {
        // 如果已经点赞，返回当前点赞数
        const [currentDiary] = await connection.query(
          'SELECT likes FROM diaries WHERE id = ?',
          [id]
        );
        return {
          success: false,
          message: '您已经点赞过了',
          likes: currentDiary[0].likes
        };
      }

      // 添加点赞记录
      await connection.query(
        'INSERT INTO diary_likes (diary_id, user_id) VALUES (?, ?)',
        [id, userId]
      );
      
      // 增加日记的点赞数
      await connection.query(
        'UPDATE diaries SET likes = likes + 1 WHERE id = ?',
        [id]
      );

      // 获取更新后的点赞数
      const [updatedDiary] = await connection.query(
        'SELECT likes FROM diaries WHERE id = ?',
        [id]
      );

      return {
        success: true,
        message: '点赞成功',
        likes: updatedDiary[0].likes
      };
    });

    console.log('点赞操作完成，返回响应:', result);
    res.json(result);

  } catch (err) {
    console.error('点赞操作失败:', err);
    console.error('错误堆栈:', err.stack);
    res.status(err.message === '日记不存在' ? 404 : 500).json({
      success: false,
      message: err.message || '点赞操作失败'
    });
  }
});

// 获取日记点赞状态
router.get('/diaries/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['user-id'];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '请先登录'
      });
    }

    // 获取日记点赞信息
    const [diary] = await db.query(
      `SELECT d.likes, 
       (SELECT COUNT(*) FROM diary_likes WHERE diary_id = d.id AND user_id = ?) as is_liked
       FROM diaries d WHERE d.id = ?`,
      [userId, id]
    );

    if (!diary || diary.length === 0) {
      return res.status(404).json({
        success: false,
        message: '日记不存在'
      });
    }

    res.json({
      success: true,
      liked: diary[0].is_liked > 0,
      likes: diary[0].likes
    });

  } catch (err) {
    console.error('获取点赞状态失败:', err);
    res.status(500).json({
      success: false,
      message: '获取点赞状态失败'
    });
  }
});

// 确保正确导出路由
module.exports = router;