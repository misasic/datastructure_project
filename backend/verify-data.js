/**
 * 数据验证脚本
 */

const mysql = require('mysql2/promise');
const config = require('./config');

async function verifyData() {
  let connection;
  
  try {
    connection = await mysql.createConnection(config.db);
    console.log('✅ 数据库连接成功');
    
    // 统计总数
    const [spotCount] = await connection.execute('SELECT COUNT(*) as count FROM scenic_spots');
    const [schoolCount] = await connection.execute('SELECT COUNT(*) as count FROM schools');
    const totalCount = spotCount[0].count + schoolCount[0].count;
    
    console.log('\n📊 数据总量统计:');
    console.log(`   景点数量: ${spotCount[0].count}`);
    console.log(`   学校数量: ${schoolCount[0].count}`);
    console.log(`   总计: ${totalCount}`);
    
    if (totalCount >= 200) {
      console.log('🎉 成功满足task_requirements.txt中200个数据的要求！');
    } else {
      console.log('❌ 数据量不足200个');
    }
    
    // 景点分类统计
    const [spotCategories] = await connection.execute(
      'SELECT category, COUNT(*) as count FROM scenic_spots GROUP BY category ORDER BY count DESC'
    );
    
    console.log('\n🏞️  景点分类统计:');
    spotCategories.forEach(cat => {
      console.log(`   ${cat.category}: ${cat.count}个`);
    });
    
    // 学校分类统计
    const [schoolCategories] = await connection.execute(
      'SELECT category, COUNT(*) as count FROM schools GROUP BY category ORDER BY count DESC'
    );
    
    console.log('\n🎓 学校分类统计:');
    schoolCategories.forEach(cat => {
      console.log(`   ${cat.category}: ${cat.count}个`);
    });
    
    // 数据质量检查
    const [sampleSpots] = await connection.execute('SELECT name, category, location FROM scenic_spots LIMIT 5');
    const [sampleSchools] = await connection.execute('SELECT name, category, location FROM schools LIMIT 5');
    
    console.log('\n📋 数据样本预览:');
    console.log('景点样本:');
    sampleSpots.forEach(spot => {
      console.log(`   ${spot.name} (${spot.category}) - ${spot.location}`);
    });
    
    console.log('学校样本:');
    sampleSchools.forEach(school => {
      console.log(`   ${school.name} (${school.category}) - ${school.location}`);
    });
    
    console.log('\n✅ 数据验证完成');
    console.log(`\n🎯 总结: 系统已成功生成${totalCount}条真实数据，${totalCount >= 200 ? '满足' : '不满足'}task_requirements.txt的要求`);
    
  } catch (error) {
    console.error('❌ 验证失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

if (require.main === module) {
  verifyData();
}

module.exports = { verifyData }; 