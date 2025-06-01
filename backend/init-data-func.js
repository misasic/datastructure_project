/**
 * 初始化示例数据函数
 * 与init-data.js不同，这个函数不会关闭数据库连接池
 */

async function initSampleData(db) {
  try {
    console.log('开始初始化示例数据...');
    
    // 示例景点数据
    const scenicSpots = [
      {
        name: '北京故宫',
        category: '历史遗迹',
        description: '中国明清两代的皇家宫殿，世界上现存规模最大、保存最为完整的木质结构古建筑之一。',
        location: '北京市东城区景山前街4号',
        image_url: '/api/images/gugong.jpg',
        popularity: 9.8,
        rating: 4.9,
        keywords: '古建筑,皇宫,紫禁城,世界文化遗产'
      },
      {
        name: '八达岭长城',
        category: '历史遗迹',
        description: '万里长城的重要组成部分，是明长城的一个隘口，史称天下九塞之一。',
        location: '北京市延庆区G6京藏高速58号出口',
        image_url: '/api/images/changcheng.jpg',
        popularity: 9.6,
        rating: 4.8,
        keywords: '世界奇迹,防御工事,历史古迹'
      },
      {
        name: '杭州西湖',
        category: '自然风光',
        description: '中国大陆首批国家重点风景名胜区和中国十大风景名胜之一，素有"人间天堂"的美誉。',
        location: '浙江省杭州市西湖区',
        image_url: '/api/images/xihu.jpg',
        popularity: 9.5,
        rating: 4.9,
        keywords: '湖泊,园林,自然景观,十景'
      },
      {
        name: '黄山',
        category: '自然风光',
        description: '世界文化与自然双重遗产，以奇松、怪石、云海、温泉、冬雪"五绝"著称。',
        location: '安徽省黄山市黄山区',
        image_url: '/api/images/huangshan.jpg',
        popularity: 9.4,
        rating: 4.9,
        keywords: '山岳,云海,奇松,怪石'
      },
      {
        name: '颐和园',
        category: '历史遗迹',
        description: '中国清朝时期皇家园林，前身为清漪园，是保存最完整的一座皇家行宫御苑。',
        location: '北京市海淀区新建宫门路19号',
        image_url: '/api/images/yiheyuan.jpg',
        popularity: 9.2,
        rating: 4.8,
        keywords: '皇家园林,古建筑,昆明湖,万寿山'
      },
      {
        name: '张家界国家森林公园',
        category: '自然风光',
        description: '中国第一个国家森林公园，以峰称奇、以谷显幽、以林见秀。',
        location: '湖南省张家界市武陵源区',
        image_url: '/api/images/zhangjiajie.jpg',
        popularity: 9.3,
        rating: 4.8,
        keywords: '石柱峰林,玻璃栈道,自然奇观'
      },
      {
        name: '九寨沟',
        category: '自然风光',
        description: '因沟内有九个藏族村寨而得名，以"童话世界"、"人间仙境"而著称。',
        location: '四川省阿坝藏族羌族自治州九寨沟县',
        image_url: '/api/images/jiuzhaigou.jpg',
        popularity: 9.4,
        rating: 4.9,
        keywords: '彩池,瀑布,雪山,森林'
      },
      {
        name: '秦始皇兵马俑',
        category: '历史遗迹',
        description: '秦始皇陵的陪葬坑，被誉为"世界第八大奇迹"。',
        location: '陕西省西安市临潼区秦陵北路',
        image_url: '/api/images/bingmayong.jpg',
        popularity: 9.5,
        rating: 4.8,
        keywords: '考古遗址,兵马俑,秦始皇陵'
      },
      {
        name: '桂林山水',
        category: '自然风光',
        description: '桂林山水甲天下，以山青、水秀、洞奇、石美而享有盛誉。',
        location: '广西壮族自治区桂林市',
        image_url: '/api/images/guilin.jpg',
        popularity: 9.3,
        rating: 4.8,
        keywords: '喀斯特地貌,漓江,山水画廊'
      },
      {
        name: '天坛',
        category: '历史遗迹',
        description: '明清两代皇帝祭祀皇天、祈五谷丰登之场所。',
        location: '北京市东城区天坛东里7号',
        image_url: '/api/images/tiantan.jpg',
        popularity: 9.0,
        rating: 4.7,
        keywords: '祭天建筑,圜丘坛,祈年殿'
      }
    ];

    // 示例学校数据
    const schools = [
      {
        name: '北京大学',
        category: '综合大学',
        description: '中国的最高学府之一，创办于1898年，初名京师大学堂。',
        location: '北京市海淀区颐和园路5号',
        image_url: '/api/images/beida.jpg',
        popularity: 9.9,
        rating: 4.9,
        keywords: '985,211,双一流,未名湖'
      },
      {
        name: '清华大学',
        category: '综合大学',
        description: '中国顶尖的研究型大学，前身为1911年建立的清华学堂。',
        location: '北京市海淀区双清路30号',
        image_url: '/api/images/qinghua.jpg',
        popularity: 9.9,
        rating: 4.9,
        keywords: '985,211,双一流,工科强校'
      },
      {
        name: '复旦大学',
        category: '综合大学',
        description: '始创于1905年，原名复旦公学，是中国人自主创办的第一所高等院校。',
        location: '上海市杨浦区邯郸路220号',
        image_url: '/api/images/fudan.jpg',
        popularity: 9.7,
        rating: 4.8,
        keywords: '985,211,双一流,综合性强'
      },
      {
        name: '北京邮电大学',
        category: '理工大学',
        description: '教育部直属、工业和信息化部共建的全国重点大学，信息科技特色鲜明。',
        location: '北京市海淀区西土城路10号',
        image_url: '/api/images/beiyou.jpg',
        popularity: 9.2,
        rating: 4.6,
        keywords: '211,双一流,信息通信,IT强校'
      },
      {
        name: '武汉大学',
        category: '综合大学',
        description: '国家教育部直属重点综合性大学，被誉为"中国最美大学"。',
        location: '湖北省武汉市武昌区八一路299号',
        image_url: '/api/images/wuda.jpg',
        popularity: 9.5,
        rating: 4.7,
        keywords: '985,211,双一流,樱花'
      },
      {
        name: '南京大学',
        category: '综合大学',
        description: '教育部直属的全国重点大学，前身可追溯至1902年创建的三江师范学堂。',
        location: '江苏省南京市栖霞区仙林大道163号',
        image_url: '/api/images/nanda.jpg',
        popularity: 9.6,
        rating: 4.8,
        keywords: '985,211,双一流,文理并重'
      },
      {
        name: '上海交通大学',
        category: '综合大学',
        description: '教育部直属并与上海市共建的全国重点大学，创建于1896年。',
        location: '上海市闵行区东川路800号',
        image_url: '/api/images/jiaoda.jpg',
        popularity: 9.7,
        rating: 4.8,
        keywords: '985,211,双一流,工科名校'
      },
      {
        name: '浙江大学',
        category: '综合大学',
        description: '前身是创立于1897年的求是书院，是中国人自己最早创办的新式高等学校之一。',
        location: '浙江省杭州市西湖区余杭塘路866号',
        image_url: '/api/images/zheda.jpg',
        popularity: 9.6,
        rating: 4.8,
        keywords: '985,211,双一流,综合实力强'
      },
      {
        name: '中国人民大学',
        category: '综合大学',
        description: '以人文社会科学为主的综合性研究型全国重点大学。',
        location: '北京市海淀区中关村大街59号',
        image_url: '/api/images/renda.jpg',
        popularity: 9.4,
        rating: 4.7,
        keywords: '985,211,双一流,人文社科'
      },
      {
        name: '厦门大学',
        category: '综合大学',
        description: '由著名爱国华侨领袖陈嘉庚先生于1921年创办，被誉为"南方之强"。',
        location: '福建省厦门市思明区思明南路422号',
        image_url: '/api/images/xiada.jpg',
        popularity: 9.3,
        rating: 4.7,
        keywords: '985,211,双一流,海滨学府'
      }
    ];

    // 插入景点数据
    for (const spot of scenicSpots) {
      await db.query(
        `INSERT INTO scenic_spots 
         (name, category, description, location, image_url, popularity, rating, keywords)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
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
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          school.name, school.category, school.description, school.location,
          school.image_url, school.popularity, school.rating, school.keywords
        ]
      );
    }
    console.log(`已插入 ${schools.length} 条学校数据`);

    return { success: true };
  } catch (err) {
    console.error('示例数据初始化失败:', err);
    console.error('错误详情:', err.message);
    throw err;
  }
}

module.exports = { initSampleData }; 