<el-table-column label="内容" min-width="200">
  <template #default="{ row }">
    <div class="diary-content">
      <div class="text-content">{{ row.content }}</div>
      <div v-if="row.images && row.images.length > 0" class="image-preview">
        <el-image
          :src="row.images[0].image_url"
          fit="cover"
          class="preview-image"
        >
          <template #error>
            <div class="image-slot">
              <i class="el-icon-picture-outline"></i>
            </div>
          </template>
        </el-image>
        <span v-if="row.images.length > 1" class="image-count">+{{ row.images.length - 1 }}</span>
      </div>
      <div v-if="row.images && row.images[0] && row.images[0].aigc_video_url" class="video-preview">
        <i class="el-icon-video-camera"></i>
        <span>AI视频</span>
      </div>
    </div>
  </template>
</el-table-column>

<style scoped>
.video-preview {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #409EFF;
  font-size: 12px;
  margin-top: 4px;
}

.video-preview i {
  font-size: 14px;
}
</style> 