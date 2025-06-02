/**
 * 扩展数据初始化脚本
 * 生成200个真实的景点和学校数据
 */

const mysql = require('mysql2/promise');
const { generateExtendedData } = require('./enhanced-data-generator');

// 数据库配置
const dbConfig = {
  host: '192.168.74.129',
  user: 'buptguider',
  password: 'buptguider2024',
  database: 'tourism_system',
  port: 3306,
  connectTimeout: 60000
};

async function initExtendedData() {
  let connection;
  
  try {
    // 连接数据库
    connection = await mysql.createConnection(dbConfig);
    console.log('数据库连接成功');
    
    // 生成扩展数据
    const { scenicSpots, universities } = await generateExtendedData();
    
    // 清空现有数据
    await connection.execute('DELETE FROM scenic_spots');
    await connection.execute('DELETE FROM schools');
    console.log('已清空现有数据');
    
    // 插入景点数据
    let spotCount = 0;
    for (const spot of scenicSpots) {
      await connection.execute(
        `INSERT INTO scenic_spots 
         (name, category, description, location, image_url, popularity, rating, keywords)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          spot.name, 
          spot.category, 
          spot.description, 
          spot.location,
          `/api/images/${spot.name.replace(/[^\w\u4e00-\u9fa5]/g, '')}.jpg`, 
          spot.popularity, 
          spot.rating, 
          spot.keywords
        ]
      );
      spotCount++;
      
      if (spotCount % 10 === 0) {
        console.log(`已插入 ${spotCount} 个景点...`);
      }
    }
    console.log(`✅ 总共插入了 ${spotCount} 个景点数据`);
    
    // 插入学校数据
    let schoolCount = 0;
    for (const school of universities) {
      await connection.execute(
        `INSERT INTO schools 
         (name, category, description, location, image_url, popularity, rating, keywords)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          school.name, 
          school.category, 
          school.description, 
          school.location,
          `/api/images/${school.name.replace(/[^\w\u4e00-\u9fa5]/g, '')}.jpg`, 
          school.popularity, 
          school.rating, 
          school.keywords
        ]
      );
      schoolCount++;
      
      if (schoolCount % 10 === 0) {
        console.log(`已插入 ${schoolCount} 个学校...`);
      }
    }
    console.log(`✅ 总共插入了 ${schoolCount} 个学校数据`);
    
    // 验证数据
    const [spotRows] = await connection.execute('SELECT COUNT(*) as count FROM scenic_spots');
    const [schoolRows] = await connection.execute('SELECT COUNT(*) as count FROM schools');
    
    console.log(`\n📊 数据统计:`);
    console.log(`景点总数: ${spotRows[0].count}`);
    console.log(`学校总数: ${schoolRows[0].count}`);
    console.log(`总数据量: ${spotRows[0].count + schoolRows[0].count}`);
    
    if (spotRows[0].count + schoolRows[0].count >= 200) {
      console.log(`✅ 成功满足 task_requirements.txt 中200个数据的要求!`);
    } else {
      console.log(`⚠️  数据量不足200个，需要继续添加`);
    }
    
    // 显示分类统计
    const [spotCategories] = await connection.execute(
      'SELECT category, COUNT(*) as count FROM scenic_spots GROUP BY category'
    );
    const [schoolCategories] = await connection.execute(
      'SELECT category, COUNT(*) as count FROM schools GROUP BY category'
    );
    
    console.log(`\n📋 景点分类统计:`);
    spotCategories.forEach(cat => {
      console.log(`  ${cat.category}: ${cat.count}个`);
    });
    
    console.log(`\n📋 学校分类统计:`);
    schoolCategories.forEach(cat => {
      console.log(`  ${cat.category}: ${cat.count}个`);
    });
    
    console.log(`\n🎉 扩展数据初始化完成！`);
    
  } catch (error) {
    console.error('数据初始化失败:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

// 检查是否直接运行此脚本
if (require.main === module) {
  initExtendedData()
    .then(() => {
      console.log('扩展数据初始化脚本执行完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { initExtendedData }; 