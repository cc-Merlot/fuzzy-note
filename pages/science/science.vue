<template>
  <view class="layout backgound">
    <view class="science">
      <z-paging ref="paging" v-model="scienceList" @query="getData" :auto-hide-loading-after-first-loaded="false"
        :default-page-size="6">
        <!-- z-paging默认铺满全屏，此时页面所有view都应放在z-paging标签内，否则会被盖住 -->
        <!-- 需要固定在页面顶部的view请通过slot="top"插入，包括自定义的导航栏 -->
        <template #top>
          <status-bar />
          <common-title title="详情"></common-title>

          <!-- 菜单 -->
          <view class="menuContainer">
            <view class="menu">
              <view class="section">
                <view class="todayScience" :class="{ active: acticeIndex == 1 }" @click="onClickBase">
                  <text class="font">基础认知</text>
                </view>
              </view>
              <view class="section">
                <view class="todayScience" :class="{ active: acticeIndex == 2 }" @click="onClickRaise">
                  <text class="font">科学养育</text>
                </view>
              </view>
              <view class="section">
                <view class="todayScience" :class="{ active: acticeIndex == 3 }" @click="onClickHealth">
                  <text class="font">健康医学</text>
                </view>
              </view>
            </view>
          </view>


          <!-- <view class="search">
            <uni-easyinput class="uni-easyinput" prefixIcon="search" v-model="value" placeholder="输入你想搜的内容"
              @iconClick="iconClick"></uni-easyinput>
          </view> -->
        </template>

        <template #loading>
          <uni-load-more status="loading"></uni-load-more>
        </template>
        <view class="container">
          <view class="articleList">
            <navigator :url="`/pages/science/detail?id=${item._id}`" class="artivleItem" v-for="item in scienceList"
              :key="item._id">
              <text class="title">{{ item.title }}</text>
              <view class="viewNumber">{{ item.view_count }}个阅读</view>
              <view class="pic">
                <image class="image" :src="item.avatar" mode="aspectFill"></image>
              </view>
            </navigator>
          </view>

          <!-- 底部安全区 -->
          <view class="safe-area-box"></view>
        </view>
      </z-paging>

    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from "@dcloudio/uni-app";

const newCloudObj = uniCloud.importObject("client-science", { customUI: true })

defineOptions({
  options: {
    styleIsolation: 'shared'
  }
})

const paging = ref(null)
const acticeIndex = ref(1)

const scienceList = ref([])

const getData = async (pageCurrent, pageSize) => {
  try {
    const { errCode, data } = await newCloudObj.list({ pageCurrent, pageSize, category: acticeIndex.value })
    if (errCode !== 0) {
      paging.value.complete(false);
      return uni.showToast({ title: '获取数据失败', icon: 'none', })
    }
    paging.value.complete(data);
  } catch (err) {
    paging.value.complete(false);
    uni.showToast({ title: '获取数据失败', icon: 'none', })
  }

}

// 点击科学养育
const onClickRaise = () => {
  acticeIndex.value = 2
  paging.value.reload()
}

// 点击基础认知
const onClickBase = () => {
  acticeIndex.value = 1
  paging.value.reload()
}

// 点击健康医学
const onClickHealth = () => {
  acticeIndex.value = 3
  paging.value.reload()
}
</script>

<style lang="scss" scoped>
.layout {
  .science {

    .menuContainer {
      padding: 0 30rpx 30rpx;

      .menu {
        margin-top: 30rpx;
        display: flex;
        justify-content: space-between;
        padding: 20rpx 40rpx;
        background-color: #fff;
        border: 3rpx solid #000;
        border-radius: 30rpx;

        .section {

          .todayScience {
            font-size: 36rpx;
            position: relative;
            display: inline-block;

            .font {
              position: relative;
              z-index: 2;
            }
          }

          .todayScience.active {
            font-weight: bold;

            .font::after {
              content: '';
              position: absolute;
              bottom: 0rpx;
              left: 0;
              width: 100%;
              height: 22rpx;
              background-color: #FFDC00;
              z-index: -1;
              border-radius: 4rpx;
            }
          }
        }

      }
    }



    .search {
      margin-top: 30rpx;

      ::v-deep .uni-easyinput__content {
        border: 1rpx solid #000 !important;
        border-radius: 20rpx !important;
      }

    }

    .container {
      padding: 0 30rpx;

      .articleList {
        padding-left: 30rpx;
        padding-top: 30rpx;

        .artivleItem {
          background-color: #fff;
          border: 3rpx solid #000;
          border-radius: 30rpx;
          padding: 30rpx 30rpx 30rpx 195rpx;
          position: relative;
          height: 202rpx;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          margin-bottom: 40rpx;

          .title {
            font-size: 28rpx;
            /* 多行省略 */
            display: -webkit-box;
            /* 弹性盒模型 */
            -webkit-box-orient: vertical;
            /* 垂直方向 */
            -webkit-line-clamp: 2;
            /* 显示3行 */
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .viewNumber {
            font-size: 24rpx;
            color: #333333;
          }

          .pic {
            width: 196rpx;
            height: 196rpx;
            position: absolute;
            top: -20rpx;
            left: -20rpx;

            .image {
              width: 100%;
              height: 100%;
              border-radius: 20rpx;
              border: 3rpx solid #000;
            }
          }
        }
      }
    }





  }
}
</style>