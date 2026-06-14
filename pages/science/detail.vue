<template>
  <view class="layout backgound">
    <view class="detail">
      <status-bar />
      <common-title title="详情"></common-title>
      <scroll-view class="scroll-view" scroll-y>
        <view class="article">
          <view class="container">
            <view class="title">{{ scienceData.title }}</view>
            <view class="content">
              <uv-parse :content="scienceData.content"></uv-parse>
            </view>
            <view class="viewNumber">{{ scienceData.view_count }}个阅读</view>
          </view>
        </view>

        <!-- 底部安全区 -->
        <view class="safe-area-box"></view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'

const newCloudObj = uniCloud.importObject("client-science", { customUI: true })

const richText1 = `
        <div style="padding: 20rpx;">
          <p style="color: #666; line-height: 1.6; margin-bottom: 15rpx;">
            欢迎使用宠物记录小程序！这里有一些<strong style="color: #ff5000;">重要的护理提示</strong>：
          </p>
          <ul style="color: #666; line-height: 1.6; padding-left: 40rpx;">
            <li>定期为宠物进行健康检查</li>
            <li>保持饮食的<strong>均衡和规律</strong></li>
            <li>每天保证足够的运动量</li>
            <li>注意宠物的情绪变化</li>
          </ul>
          <p style="color: #4cd964; background: #f0fff0; padding: 20rpx; border-radius: 8rpx; margin-top: 20rpx;">
            💡 <strong>小贴士：</strong>记录宠物的日常习惯有助于及时发现健康问题。
          </p>
        </div>
      `

const scienceData = ref({})
onLoad((e) => {
  let { id } = e
  getData(id)
})

const getData = async (id) => {
  try {
    uni.showLoading({
      title: '加载中...',
      mask: true
    })
    const { errCode, data } = await newCloudObj.detail(id)
    if (errCode !== 0) return uni.showToast({ title: '获取数据失败', icon: 'none', })
    scienceData.value = data
  } catch (err) {
    uni.showToast({ title: '获取数据失败', icon: 'none', })
  } finally {
    uni.hideLoading()
  }
}
</script>

<style lang="scss" scoped>
.detail {
  display: flex;
  flex-direction: column;
  height: 100vh;

  .scroll-view {
    flex: 1;
    overflow-y: auto;
  }


  .article {
    margin-top: 10rpx;
    padding: 0 30rpx 30rpx;

    .container {
      background-color: #fff;
      border: 3rpx solid #000;
      border-radius: 30rpx;
      padding: 30rpx;
      min-height: 80vh;
      display: flex;
      flex-direction: column;

      .title {
        font-size: 36rpx;
        font-weight: 600;
      }

      .content {
        margin-top: 30rpx;
        font-size: 28rpx;
        flex: 1;
      }

      .viewNumber {
        margin-top: 30rpx;
        font-size: 24rpx;
        color: #333;
      }
    }
  }
}
</style>