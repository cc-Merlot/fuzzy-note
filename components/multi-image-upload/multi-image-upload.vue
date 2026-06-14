<template>
  <!-- 多图片上传组件 -->
  <view class="multi-image-upload">
    <view class="image-list">
      <!-- 已上传的图片 -->
      <view v-for="(image, index) in imageList" :key="index" class="image-item">
        <view class="image-wrapper">
          <image :src="image.url" mode="aspectFit" class="image-preview" @click="previewImage(index)" />
          <view class="image-actions">
            <!-- 删除按钮 -->
            <view class="delete-btn" @click.stop="removeImage(index)">
              <uni-icons type="closeempty" size="16" color="#fff"></uni-icons>
            </view>

            <!-- 主图标识 -->
            <view v-if="index === 0" class="primary-badge" @click.stop="setAsPrimary(index)">
              主图
            </view>

            <!-- 重新上传按钮 -->
            <view v-if="enableReupload" class="reupload-btn" @click.stop="reuploadImage(index)">
              <uni-icons type="refreshempty" size="14" color="#fff"></uni-icons>
            </view>
          </view>

          <!-- 上传进度 -->
          <view v-if="uploadStates[index] && uploadStates[index].uploading" class="upload-progress">
            <view class="progress-bar" :style="{ width: uploadStates[index].progress + '%' }"></view>
            <text class="progress-text">
              {{ uploadStates[index].progress }}%
            </text>
          </view>
        </view>

        <!-- 图片描述输入框 -->
        <view v-if="enableDescription" class="image-description">
          <input v-model="image.descriptions[index]" type="text" placeholder="添加描述..." class="description-input"
            @input="updateDescription(index, $event)" maxlength="30" />
        </view>
      </view>

      <!-- 上传按钮（最多3张） -->
      <view v-if="imageList.length < maxCount" class="upload-btn-wrapper" @click="chooseImage">
        <view class="upload-btn">
          <uni-icons type="plusempty" size="24" color="#999"></uni-icons>
          <text class="upload-text">添加图片</text>
          <text class="upload-count">({{ imageList.length }}/{{ maxCount }})</text>
        </view>

        <!-- 上传状态 -->
        <view v-if="isUploading" class="uploading-state">
          <uni-icons type="spinner-cycle" size="16" color="#007aff" class="spinner"></uni-icons>
          <text>上传中...</text>
        </view>
      </view>
    </view>

    <!-- 错误提示 -->
    <view v-if="errorMessage" class="error-message">
      <uni-icons type="clear" size="14" color="#ff4444"></uni-icons>
      <text>{{ errorMessage }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// 定义 props
const props = defineProps({
  // 初始图片列表
  modelValue: {
    type: Array,
    default: () => []
  },
  // 最大上传数量
  maxCount: {
    type: Number,
    default: 3
  },
  // 标题
  title: {
    type: String,
    default: '上传图片'
  },
  // 是否显示提示
  showTips: {
    type: Boolean,
    default: true
  },
  // 是否启用描述输入
  enableDescription: {
    type: Boolean,
    default: false
  },
  // 是否允许重新上传
  enableReupload: {
    type: Boolean,
    default: true
  },
  // 上传目标路径
  uploadPath: {
    type: String,
    default: 'pet/images'
  },
  // 图片压缩选项
  compressOptions: {
    type: Object,
    default: () => ({
      quality: 80,
      maxWidth: 1200,
      maxHeight: 1200
    })
  }
})

// 定义 emits
const emit = defineEmits([
  'update:modelValue',
  'change',
  'success',
  'error',
  'complete',
  'delete'
])

// 响应式数据
const imageList = ref(props.modelValue.map(img => ({
  url: typeof img === 'string' ? img : img.url,
  fileID: img.fileID || '',
  description: img.description || ''
})))
const uploadStates = ref({}) // 上传状态
const isUploading = ref(false)
const errorMessage = ref('')

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  imageList.value = newVal.map(img => ({
    url: typeof img === 'string' ? img : img.url,
    fileID: img.fileID || '',
    description: img.description || ''
  }))
}, { deep: true })

// 选择图片
const chooseImage = async () => {
  try {
    errorMessage.value = ''

    // 计算还能选择多少张
    const remainingCount = props.maxCount - imageList.value.length
    if (remainingCount <= 0) {
      errorMessage.value = `最多只能上传 ${props.maxCount} 张图片`
      return
    }

    // 调用 uni.chooseImage
    const chooseResult = await new Promise((resolve, reject) => {
      uni.chooseImage({
        count: remainingCount,
        sizeType: ['compressed', 'original'],
        sourceType: ['album', 'camera'],
        success: resolve,
        fail: reject
      })
    })

    // 处理选择的图片
    const tempFilePaths = chooseResult.tempFilePaths
    await uploadImages(tempFilePaths)

  } catch (error) {
    handleError(error)
  }
}

// 上传图片
const uploadImages = async (filePaths) => {
  isUploading.value = true

  try {
    const uploadPromises = filePaths.map(async (filePath, index) => {
      const uploadIndex = imageList.value.length + index

      // 设置上传状态
      uploadStates.value[uploadIndex] = {
        uploading: true,
        progress: 0
      }

      // 压缩图片（如果需要）
      let finalFilePath = filePath
      // if (props.compressOptions) {
      //   finalFilePath = await compressImage(filePath)
      // }

      // 上传到云存储
      const uploadResult = await uniCloud.uploadFile({
        filePath: finalFilePath,
        cloudPath: `${props.uploadPath}/${Date.now()}_${Math.random().toString(36).substr(2)}.jpg`,
        onUploadProgress: (progressEvent) => {
          // 更新上传进度
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100)
          uploadStates.value[uploadIndex].progress = progress
        }
      })

      // 获取文件访问地址
      const fileURL = await getFileUrl(uploadResult.fileID)

      // 添加到图片列表
      imageList.value.push({
        url: fileURL,
        fileID: uploadResult.fileID,
        description: ''
      })

      // 更新状态
      uploadStates.value[uploadIndex] = {
        uploading: false,
        progress: 100
      }

      return {
        url: fileURL,
        fileID: uploadResult.fileID
      }
    })

    const uploadedImages = await Promise.all(uploadPromises)

    // 触发事件
    emit('update:modelValue', imageList.value)
    emit('change', imageList.value)
    emit('success', uploadedImages)

    // 清理上传状态
    setTimeout(() => {
      uploadStates.value = {}
    }, 1000)

  } catch (error) {
    handleError(error)
  } finally {
    isUploading.value = false
    emit('complete', imageList.value)
  }
}

// 压缩图片
const compressImage = (filePath) => {
  return new Promise((resolve, reject) => {
    uni.compressImage({
      src: filePath,
      quality: props.compressOptions.quality || 80,
      compressedWidth: props.compressOptions.maxWidth || 1200,
      compressedHeight: props.compressOptions.maxHeight || 1200,
      success: (result) => resolve(result.tempFilePath),
      fail: reject
    })
  })
}

// 获取文件 URL
const getFileUrl = async (fileID) => {
  // 如果是云存储文件ID，需要转换
  if (fileID && fileID.startsWith('cloud://')) {
    const res = await uniCloud.getTempFileURL({
      fileList: [fileID]
    })
    return res.fileList[0].tempFileURL
  }
  return fileID
}

// 删除图片
const removeImage = (index) => {
  const removedImage = imageList.value[index]

  // 从列表中移除
  imageList.value.splice(index, 1)

  // 触发事件
  emit('update:modelValue', imageList.value)
  emit('change', imageList.value)
  emit('delete', {
    index,
    image: removedImage
  })

  // 如果删除了主图，自动将第一张设为主图
  if (index === 0 && imageList.value.length > 0) {
    // 可以触发主图变更事件
    emit('primary-changed', 0)
  }
}

// 重新上传图片
const reuploadImage = async (index) => {
  try {
    const chooseResult = await new Promise((resolve, reject) => {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album'],
        success: resolve,
        fail: reject
      })
    })

    const oldImage = imageList.value[index]
    const filePath = chooseResult.tempFilePaths[0]

    // 压缩
    const compressedPath = await compressImage(filePath)

    // 上传
    uploadStates.value[index] = {
      uploading: true,
      progress: 0
    }

    const uploadResult = await uniCloud.uploadFile({
      filePath: compressedPath,
      cloudPath: `${props.uploadPath}/reupload_${Date.now()}.jpg`
    })

    const fileURL = await getFileUrl(uploadResult.fileID)

    // 更新图片
    imageList.value[index] = {
      ...oldImage,
      url: fileURL,
      fileID: uploadResult.fileID
    }

    uploadStates.value[index] = {
      uploading: false,
      progress: 100
    }

    emit('update:modelValue', imageList.value)
    emit('change', imageList.value)
    emit('reupload', {
      index,
      newImage: imageList.value[index],
      oldImage
    })

  } catch (error) {
    handleError(error)
  }
}

// 设为封面/主图
const setAsPrimary = (index) => {
  if (index === 0) return // 已经是主图

  const [primaryImage] = imageList.value.splice(index, 1)
  imageList.value.unshift(primaryImage)

  emit('update:modelValue', imageList.value)
  emit('change', imageList.value)
  emit('primary-changed', 0)
}

// 预览图片
const previewImage = (index) => {
  const urls = imageList.value.map(img => img.url)
  uni.previewImage({
    current: index,
    urls: urls
  })
}

// 更新描述
const updateDescription = (index, event) => {
  const description = event.detail?.value || event.target?.value
  imageList.value[index].description = description

  emit('update:modelValue', imageList.value)
  emit('change', imageList.value)
  emit('description-changed', {
    index,
    description
  })
}

// 错误处理
const handleError = (error) => {
  console.error('图片上传错误:', error)

  let message = '上传失败'
  if (error.errMsg) {
    if (error.errMsg.includes('cancel')) {
      message = '取消了选择'
    } else if (error.errMsg.includes('size')) {
      message = '图片大小超过限制'
    } else if (error.errMsg.includes('permission')) {
      message = '没有相册访问权限'
    }
  }

  errorMessage.value = message
  emit('error', error)

  // 3秒后清除错误信息
  setTimeout(() => {
    errorMessage.value = ''
  }, 3000)
}

// 暴露方法给父组件
defineExpose({
  chooseImage,
  removeImage,
  reuploadImage,
  setAsPrimary,
  previewImage,
  clearAll: () => {
    imageList.value = []
    emit('update:modelValue', [])
    emit('change', [])
  },
  getImageList: () => imageList.value,
  isUploading: () => isUploading.value
})
</script>

<style lang="scss" scoped>
.multi-image-upload {
  width: 100%;

  .upload-title {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    margin-bottom: 16rpx;
  }

  .image-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;

    .image-item {
      width: calc((100% - 40rpx) / 3);
      position: relative;

      .image-wrapper {
        position: relative;
        width: 100%;
        aspect-ratio: 1;
        border-radius: 12rpx;
        overflow: hidden;
        background-color: #f5f5f5;

        .image-preview {
          width: 100%;
          height: 100%;
          display: block;
        }

        .image-actions {
          position: absolute;
          top: 8rpx;
          right: 8rpx;
          display: flex;
          gap: 6rpx;

          .delete-btn {
            width: 40rpx;
            height: 40rpx;
            background-color: rgba(0, 0, 0, 0.6);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background-color 0.3s;

            &:active {
              background-color: rgba(0, 0, 0, 0.8);
            }
          }

          .primary-badge {
            padding: 4rpx 12rpx;
            background-color: rgba(255, 107, 107, 0.8);
            color: white;
            font-size: 20rpx;
            border-radius: 20rpx;
            cursor: default;
          }

          .reupload-btn {
            width: 40rpx;
            height: 40rpx;
            background-color: rgba(0, 122, 255, 0.8);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;

            &:active {
              background-color: rgba(0, 122, 255, 1);
            }
          }
        }

        .upload-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 40rpx;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;

          .progress-bar {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            background-color: #4cd964;
            transition: width 0.3s;
          }

          .progress-text {
            position: relative;
            z-index: 1;
            color: white;
            font-size: 20rpx;
          }
        }
      }

      .image-description {
        margin-top: 8rpx;

        .description-input {
          width: 100%;
          height: 60rpx;
          padding: 0 12rpx;
          border: 1rpx solid #e5e5e5;
          border-radius: 8rpx;
          font-size: 24rpx;
          background-color: #fafafa;

          &:focus {
            border-color: #007aff;
            outline: none;
          }
        }
      }
    }

    .upload-btn-wrapper {
      width: calc((100% - 40rpx) / 3);
      aspect-ratio: 1;
      border: 2rpx dashed #e5e5e5;
      border-radius: 12rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
      position: relative;
      background-color: #fafafa;

      &:active {
        background-color: #f0f0f0;
        border-color: #007aff;
      }

      .upload-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8rpx;

        .upload-text {
          font-size: 24rpx;
          color: #666;
        }

        .upload-count {
          font-size: 20rpx;
          color: #999;
        }
      }

      .uploading-state {
        position: absolute;
        bottom: 20rpx;
        left: 0;
        right: 0;
        text-align: center;
        font-size: 22rpx;
        color: #007aff;

        .spinner {
          animation: spin 1s linear infinite;
          margin-right: 8rpx;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }

          100% {
            transform: rotate(360deg);
          }
        }
      }
    }
  }

  .upload-tips {
    margin-top: 16rpx;
    display: flex;
    align-items: center;
    gap: 8rpx;
    color: #999;
    font-size: 22rpx;

    .tip-text {
      font-size: 22rpx;
    }
  }

  .error-message {
    margin-top: 16rpx;
    padding: 12rpx 16rpx;
    background-color: #fff2f0;
    border: 1rpx solid #ffccc7;
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    gap: 8rpx;
    color: #ff4444;
    font-size: 24rpx;
    animation: fadeIn 0.3s;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }
}

// 响应式调整
@media (max-width: 480px) {
  .multi-image-upload {
    .image-list {
      gap: 12rpx;

      .image-item,
      .upload-btn-wrapper {
        width: calc((100% - 24rpx) / 3);
      }
    }
  }
}
</style>