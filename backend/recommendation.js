/**
 * 旅游推荐核心算法模块
 */
const db = require('./db');

/**
 * 快速选择算法 - 用于高效获取前K个元素
 * 时间复杂度: O(n)，比完全排序O(nlogn)更高效
 * @param {Array} arr 待排序数组
 * @param {Number} left 左边界
 * @param {Number} right 右边界
 * @param {Number} k 需要的前k个元素
 * @param {String} sortKey 排序关键字
 * @param {Boolean} descending 是否降序
 */
function quickSelect(arr, left, right, k, sortKey, descending = true) {
  if (left === right) return;

  const pivot = partition(arr, left, right, sortKey, descending);
  
  // 如果枢轴位置正好是k，就已经找到了前k个元素
  if (pivot === k) return;
  
  // 如果枢轴位置大于k，继续在左侧寻找
  if (pivot > k) {
    quickSelect(arr, left, pivot - 1, k, sortKey, descending);
  } else {
    // 如果枢轴位置小于k，继续在右侧寻找
    quickSelect(arr, pivot + 1, right, k, sortKey, descending);
  }
}

/**
 * 分区函数 - 快速选择的辅助函数
 */
function partition(arr, left, right, sortKey, descending) {
  // 选择最右边的元素作为枢轴
  const pivotValue = arr[right][sortKey];
  let i = left;
  
  for (let j = left; j < right; j++) {
    // 根据升序或降序进行比较
    if (descending ? arr[j][sortKey] > pivotValue : arr[j][sortKey] < pivotValue) {
      // 交换元素
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  
  // 将枢轴放到正确的位置
  [arr[i], arr[right]] = [arr[right], arr[i]];
  return i;
}

/**
 * 获取景点推荐列表
 * @param {Object} options 查询选项
 * @returns {Promise<Array>} 推荐的景点列表
 */
async function getScenicSpotRecommendations(options = {}) {
  const {
    userId = null,
    limit = 10,
    sortBy = 'popularity', // popularity, rating
    category = null,
    keyword = null,
  } = options;

  let query = 'SELECT * FROM scenic_spots WHERE 1=1';
  const params = [];

  // 根据分类筛选
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  // 根据关键词筛选
  if (keyword) {
    query += ' AND (name LIKE ? OR keywords LIKE ? OR description LIKE ?)';
    const likeParam = `%${keyword}%`;
    params.push(likeParam, likeParam, likeParam);
  }

  try {
    // 获取所有符合条件的景点
    const spots = await db.query(query, params);
    
    // 如果没有指定用户，直接按照指定字段排序
    if (!userId) {
      // 使用快速选择获取前K个元素
      if (spots.length > limit) {
        quickSelect(spots, 0, spots.length - 1, limit - 1, sortBy);
        return spots.slice(0, limit);
      }
      return spots;
    }

    // 如果指定了用户，考虑用户偏好进行个性化推荐
    // 获取用户的分类偏好
    const userPreferences = await db.query(
      'SELECT category, interest_level FROM user_preferences WHERE user_id = ?',
      [userId]
    );
    
    // 创建分类偏好映射
    const preferenceMap = {};
    userPreferences.forEach(pref => {
      preferenceMap[pref.category] = pref.interest_level;
    });
    
    // 计算个性化评分
    spots.forEach(spot => {
      // 基础分数是热度或评分
      let score = spot[sortBy];
      
      // 如果用户对此分类有偏好，应用偏好因子
      if (preferenceMap[spot.category]) {
        score *= (1 + preferenceMap[spot.category] / 5); // 偏好因子范围0-1
      }
      
      spot.personalizedScore = score;
    });
    
    // 使用快速选择获取前K个元素
    if (spots.length > limit) {
      quickSelect(spots, 0, spots.length - 1, limit - 1, 'personalizedScore');
      return spots.slice(0, limit);
    }
    return spots;
  } catch (err) {
    console.error('获取景点推荐失败:', err);
    throw err;
  }
}

/**
 * 获取学校推荐列表
 * @param {Object} options 查询选项
 * @returns {Promise<Array>} 推荐的学校列表
 */
async function getSchoolRecommendations(options = {}) {
  const {
    userId = null,
    limit = 10,
    sortBy = 'popularity', // popularity, rating
    category = null,
    keyword = null,
  } = options;

  let query = 'SELECT * FROM schools WHERE 1=1';
  const params = [];

  // 根据分类筛选
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  // 根据关键词筛选
  if (keyword) {
    query += ' AND (name LIKE ? OR keywords LIKE ? OR description LIKE ?)';
    const likeParam = `%${keyword}%`;
    params.push(likeParam, likeParam, likeParam);
  }

  try {
    // 获取所有符合条件的学校
    const schools = await db.query(query, params);
    
    // 如果没有指定用户，直接按照指定字段排序
    if (!userId) {
      // 使用快速选择获取前K个元素
      if (schools.length > limit) {
        quickSelect(schools, 0, schools.length - 1, limit - 1, sortBy);
        return schools.slice(0, limit);
      }
      return schools;
    }

    // 如果指定了用户，考虑用户偏好进行个性化推荐
    // 获取用户的分类偏好
    const userPreferences = await db.query(
      'SELECT category, interest_level FROM user_preferences WHERE user_id = ?',
      [userId]
    );
    
    // 创建分类偏好映射
    const preferenceMap = {};
    userPreferences.forEach(pref => {
      preferenceMap[pref.category] = pref.interest_level;
    });
    
    // 计算个性化评分
    schools.forEach(school => {
      // 基础分数是热度或评分
      let score = school[sortBy];
      
      // 如果用户对此分类有偏好，应用偏好因子
      if (preferenceMap[school.category]) {
        score *= (1 + preferenceMap[school.category] / 5); // 偏好因子范围0-1
      }
      
      school.personalizedScore = score;
    });
    
    // 使用快速选择获取前K个元素
    if (schools.length > limit) {
      quickSelect(schools, 0, schools.length - 1, limit - 1, 'personalizedScore');
      return schools.slice(0, limit);
    }
    return schools;
  } catch (err) {
    console.error('获取学校推荐失败:', err);
    throw err;
  }
}

/**
 * 设置用户对某个分类的偏好
 * @param {Number} userId 用户ID
 * @param {String} category 分类
 * @param {Number} interestLevel 兴趣级别(0-5)
 */
async function setUserPreference(userId, category, interestLevel) {
  try {
    await db.query(
      `INSERT INTO user_preferences (user_id, category, interest_level) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE interest_level = ?`,
      [userId, category, interestLevel, interestLevel]
    );
    return { success: true };
  } catch (err) {
    console.error('设置用户偏好失败:', err);
    throw err;
  }
}

module.exports = {
  getScenicSpotRecommendations,
  getSchoolRecommendations,
  setUserPreference
}; 