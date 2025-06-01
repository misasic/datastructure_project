/**
 * 初始化示例数据
 */
const db = require('./db');

async function initSampleData() {
  try {
    console.log('开始初始化示例数据...');
    
    // 示例景点数据
    const scenicSpots = [
      {
        name: '北京故宫',
        category: '历史遗迹',
        description: '中国明清两代的皇家宫殿，世界上现存规模最大、保存最为完整的木质结构古建筑之一。',
        location: '北京市东城区景山前街4号',
        image_url: 'https://via.placeholder.com/800x600?text=故宫',
        popularity: 9.8,
        rating: 4.9,
        keywords: '古建筑,皇宫,紫禁城,世界文化遗产'
      },
      {
        name: '长城',
        category: '历史遗迹',
        description: '中国古代的伟大防御工程，是中华民族的骄傲和象征。',
        location: '北京市怀柔区',
        image_url: 'https://via.placeholder.com/800x600?text=长城',
        popularity: 9.7,
        rating: 4.8,
        keywords: '古代防御工程,世界文化遗产,军事建筑'
      },
      {
        name: '西湖',
        category: '自然风光',
        description: '中国浙江省杭州市区西部的淡水湖，被誉为人间天堂。',
        location: '浙江省杭州市西湖区',
        image_url: 'https://via.placeholder.com/800x600?text=西湖',
        popularity: 9.5,
        rating: 4.8,
        keywords: '湖泊,自然景观,世界文化遗产'
      },
      {
        name: '黄山',
        category: '自然风光',
        description: '中国安徽省南部的山脉，以奇松、怪石、云海、温泉、冬雪著称。',
        location: '安徽省黄山市',
        image_url: 'https://via.placeholder.com/800x600?text=黄山',
        popularity: 9.3,
        rating: 4.7,
        keywords: '山脉,自然景观,世界文化遗产'
      },
      {
        name: '颐和园',
        category: '历史遗迹',
        description: '中国清朝时期皇家园林，是保存最完整的一座皇家行宫御苑。',
        location: '北京市海淀区新建宫门路19号',
        image_url: 'https://via.placeholder.com/800x600?text=颐和园',
        popularity: 9.2,
        rating: 4.6,
        keywords: '皇家园林,古建筑,世界文化遗产'
      },
      {
        name: '张家界',
        category: '自然风光',
        description: '中国湖南省西北部的武陵源风景区，以奇特的石英砂岩峰林地貌著称。',
        location: '湖南省张家界市',
        image_url: 'https://via.placeholder.com/800x600?text=张家界',
        popularity: 9.1,
        rating: 4.6,
        keywords: '山脉,自然景观,世界自然遗产'
      },
      {
        name: '九寨沟',
        category: '自然风光',
        description: '中国四川省阿坝藏族羌族自治州九寨沟县的风景区，以彩池、瀑布、雪山、森林著称。',
        location: '四川省阿坝藏族羌族自治州九寨沟县',
        image_url: 'https://via.placeholder.com/800x600?text=九寨沟',
        popularity: 9.0,
        rating: 4.5,
        keywords: '湖泊,瀑布,自然景观,世界自然遗产'
      },
      {
        name: '兵马俑',
        category: '历史遗迹',
        description: '中国秦始皇陵的陪葬坑，被誉为"世界第八大奇迹"。',
        location: '陕西省西安市临潼区',
        image_url: 'https://via.placeholder.com/800x600?text=兵马俑',
        popularity: 8.9,
        rating: 4.5,
        keywords: '古代军事,世界文化遗产,秦始皇'
      },
      {
        name: '桂林山水',
        category: '自然风光',
        description: '中国广西壮族自治区桂林市的自然景观，以喀斯特地貌著称。',
        location: '广西壮族自治区桂林市',
        image_url: 'https://via.placeholder.com/800x600?text=桂林山水',
        popularity: 8.8,
        rating: 4.4,
        keywords: '山水,喀斯特地貌,自然景观'
      },
      {
        name: '天坛',
        category: '历史遗迹',
        description: '中国明清两代帝王祭天的场所，是现存规模最大、体系最完整的古代祭祀建筑群。',
        location: '北京市东城区天坛路',
        image_url: 'https://via.placeholder.com/800x600?text=天坛',
        popularity: 8.7,
        rating: 4.3,
        keywords: '古建筑,祭祀建筑,世界文化遗产'
      }
    ];

    // 示例学校数据
    const schools = [
      {
        name: '北京大学',
        category: '综合类大学',
        description: '中国最著名的高等学府之一，被誉为"中国最好的大学"。',
        location: '北京市海淀区颐和园路5号',
        image_url: 'https://via.placeholder.com/800x600?text=北京大学',
        popularity: 9.9,
        rating: 5.0,
        keywords: '985工程,211工程,双一流,C9联盟'
      },
      {
        name: '清华大学',
        category: '理工类大学',
        description: '中国著名的高等学府，被誉为"工程师的摇篮"。',
        location: '北京市海淀区清华园1号',
        image_url: 'https://via.placeholder.com/800x600?text=清华大学',
        popularity: 9.9,
        rating: 5.0,
        keywords: '985工程,211工程,双一流,C9联盟'
      },
      {
        name: '复旦大学',
        category: '综合类大学',
        description: '中国著名的高等学府，是中国人文社会科学的重镇。',
        location: '上海市杨浦区邯郸路220号',
        image_url: 'https://via.placeholder.com/800x600?text=复旦大学',
        popularity: 9.7,
        rating: 4.9,
        keywords: '985工程,211工程,双一流,C9联盟'
      },
      {
        name: '北京邮电大学',
        category: '理工类大学',
        description: '中国信息科技领域的著名高校，被誉为"通信工程师的摇篮"。',
        location: '北京市海淀区西土城路10号',
        image_url: 'https://via.placeholder.com/800x600?text=北京邮电大学',
        popularity: 9.5,
        rating: 4.8,
        keywords: '211工程,双一流,通信,信息技术'
      },
      {
        name: '武汉大学',
        category: '综合类大学',
        description: '中国著名的高等学府，校园环境优美，樱花盛开时尤为壮观。',
        location: '湖北省武汉市武昌区珞珈山',
        image_url: 'https://via.placeholder.com/800x600?text=武汉大学',
        popularity: 9.4,
        rating: 4.7,
        keywords: '985工程,211工程,双一流,樱花'
      },
      {
        name: '南京大学',
        category: '综合类大学',
        description: '中国著名的高等学府，历史悠久，学科齐全。',
        location: '江苏省南京市鼓楼区汉口路22号',
        image_url: 'https://via.placeholder.com/800x600?text=南京大学',
        popularity: 9.3,
        rating: 4.7,
        keywords: '985工程,211工程,双一流,C9联盟'
      },
      {
        name: '上海交通大学',
        category: '理工类大学',
        description: '中国著名的高等学府，工程技术实力雄厚。',
        location: '上海市闵行区东川路800号',
        image_url: 'https://via.placeholder.com/800x600?text=上海交通大学',
        popularity: 9.2,
        rating: 4.6,
        keywords: '985工程,211工程,双一流,C9联盟'
      },
      {
        name: '浙江大学',
        category: '综合类大学',
        description: '中国著名的高等学府，学科门类齐全，综合实力强劲。',
        location: '浙江省杭州市西湖区余杭塘路866号',
        image_url: 'https://via.placeholder.com/800x600?text=浙江大学',
        popularity: 9.1,
        rating: 4.6,
        keywords: '985工程,211工程,双一流,C9联盟'
      },
      {
        name: '中国人民大学',
        category: '人文社科类大学',
        description: '中国著名的高等学府，人文社会科学实力雄厚。',
        location: '北京市海淀区中关村大街59号',
        image_url: 'https://via.placeholder.com/800x600?text=中国人民大学',
        popularity: 9.0,
        rating: 4.5,
        keywords: '985工程,211工程,双一流,人文社科'
      },
      {
        name: '厦门大学',
        category: '综合类大学',
        description: '中国著名的高等学府，环境优美，被誉为"中国最美大学"。',
        location: '福建省厦门市思明区思明南路422号',
        image_url: 'https://via.placeholder.com/800x600?text=厦门大学',
        popularity: 8.9,
        rating: 4.5,
        keywords: '985工程,211工程,双一流,滨海大学'
      }
    ];

    // 插入景点数据
    for (const spot of scenicSpots) {
      await db.query(
        `INSERT INTO scenic_spots 
         (name, category, description, location, image_url, popularity, rating, keywords)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         description = VALUES(description),
         location = VALUES(location),
         image_url = VALUES(image_url),
         popularity = VALUES(popularity),
         rating = VALUES(rating),
         keywords = VALUES(keywords)`,
        [
          spot.name, spot.category, spot.description, spot.location,
          spot.image_url, spot.popularity, spot.rating, spot.keywords
        ]
      );
    }
    console.log(`已插入 ${scenicSpots.length} 条景点数据`);

    // 插入学校数据
    for (const school of schools) {
      await db.query(
        `INSERT INTO schools 
         (name, category, description, location, image_url, popularity, rating, keywords)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         description = VALUES(description),
         location = VALUES(location),
         image_url = VALUES(image_url),
         popularity = VALUES(popularity),
         rating = VALUES(rating),
         keywords = VALUES(keywords)`,
        [
          school.name, school.category, school.description, school.location,
          school.image_url, school.popularity, school.rating, school.keywords
        ]
      );
    }
    console.log(`已插入 ${schools.length} 条学校数据`);

    console.log('示例数据初始化完成!');
  } catch (err) {
    console.error('示例数据初始化失败:', err);
    console.error('错误详情:', err.message);
  } finally {
    // 关闭连接池
    if (db.pool) {
      console.log('关闭数据库连接池...');
      await db.pool.end();
    }
  }
}

// 执行初始化
initSampleData(); 