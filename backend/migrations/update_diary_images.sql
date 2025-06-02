-- 为diaries表添加内容压缩相关字段
ALTER TABLE diaries
ADD COLUMN content_compressed BOOLEAN DEFAULT FALSE,
ADD COLUMN content_original_size INT DEFAULT NULL,
ADD COLUMN content_compressed_size INT DEFAULT NULL,
ADD COLUMN content_compression_ratio FLOAT DEFAULT NULL,
ADD COLUMN content_compressed_at TIMESTAMP NULL;

-- 为diaries表添加全文索引
ALTER TABLE diaries
ADD FULLTEXT INDEX idx_content (content);

-- 创建日记内容压缩记录表
CREATE TABLE IF NOT EXISTS diary_content_compression_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  diary_id INT NOT NULL,
  original_size INT NOT NULL,
  compressed_size INT NOT NULL,
  compression_ratio FLOAT NOT NULL,
  compression_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (diary_id) REFERENCES diaries(id) ON DELETE CASCADE
);

-- 创建动画生成记录表
CREATE TABLE IF NOT EXISTS animation_generation_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  image_id INT NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'failed') NOT NULL,
  error_message TEXT,
  generation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completion_time TIMESTAMP NULL,
  FOREIGN KEY (image_id) REFERENCES diary_images(id) ON DELETE CASCADE
); 