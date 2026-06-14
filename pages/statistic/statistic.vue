<template>
  <!-- 页面整体布局容器，适配安全区 -->
  <view class="layout backgound">
    <status-bar />

    <!-- ================= 顶部 Header ================= -->
    <view class="header">
      <text class="title">毛茸宠记本</text>
      <!-- 更多操作图标（预留） -->
      <text class="icon-diandian iconfont more-icon"></text>
    </view>

    <!-- ================= Tab 切换区 ================= -->
    <view class="tabs-wrap">
      <view class="tabs">

        <!-- 身体数据 Tab -->
        <view :class="['tab', { active: currentTab === 'body' }]" @click="currentTab = 'body'">
          <text class="circle body-circle"></text>
          <text class="text">身体</text>
        </view>

        <!-- 记事本 Tab -->
        <view :class="['tab', { active: currentTab === 'notebook' }]" @click="clickNoteTab">
          <text class="circle notebook-circle"></text>
          <text class="text">记事本</text>
        </view>

      </view>
    </view>

    <!-- ================= 主内容区域 ================= -->
    <view class="content">
      <view v-if="currentTab === 'body'" class="pet" @click="openPetPopup">
        当前宠物：
        <view class="name" v-if="!XEUtils.isEmpty(selectedPet)">{{ selectedPet.name }}</view>
        <view class="name" v-else>暂无</view>
        <view><uni-icons type="right" size="18"></uni-icons></view>
      </view>

      <!-- 数据加载中的占位提示 -->
      <view v-if="isLoading" class="loading-placeholder">
        <text>数据加载中...</text>
      </view>

      <!-- ================= 身体数据页 ================= -->
      <block v-else-if="currentTab === 'body'">

        <!-- ===== 体重变化折线图 ===== -->
        <view class="card chart-card">
          <view class="card-title-row">
            <text class="iconfont icon-tizhong icon-left"></text>
            <text class="chart-title">体重变化</text>
            <text class="period">近30天</text>
          </view>
          <weightChart ref="weightChartRef" v-if="!isMyPetPopopOpen"></weightChart>

        </view>

        <!-- ===== 饮水量（预留） ===== -->
        <view class="card chart-card">
          <view class="card-title-row">
            <text class="iconfont icon-heshui icon-left"></text>
            <text class="chart-title">饮水量</text>
            <text class="period">近30天</text>
          </view>

          <!-- 当前为占位，后续可替换为图表 -->
          <drinkChart ref="drinkChartRef" v-if="!isMyPetPopopOpen"></drinkChart>
        </view>

        <!-- ===== 便便记录（点状图预留） ===== -->
        <!-- <view class="card chart-card">
          <view class="card-title-row">
            <text class="iconfont icon-bianbian icon-left"></text>
            <text class="chart-title">便便</text>
            <text class="period">{{ bodyData.poo.period }}</text>
          </view>

          <view class="chart-container small-chart">
            <text class="placeholder-text">点状图占位</text>
          </view>
        </view> -->

        <!-- ===== 喂食记录（点状图预留） ===== -->
        <!-- <view class="card chart-card">
          <view class="card-title-row">
            <text class="iconfont icon-yinshi icon-left"></text>
            <text class="chart-title">喂食</text>
            <text class="period">{{ bodyData.feed.period }}</text>
          </view>

          <view class="chart-container small-chart">
            <text class="placeholder-text">点状图占位</text>
          </view>
        </view> -->

        <!-- ===== 运动量评估模块 ===== -->
        <!-- <view class="card evaluation-card">
          <text class="title">运动量评估(按月计算)</text>
          <view class="indicator">
            <text>太少</text>
            <text :class="['status', { active: bodyData.exercise.status === '健康' }]">
              健康
            </text>
            <text>太多</text>
          </view>
          <view class="progress-bar">
            <view class="bar-bg"></view>
            <view class="bar-dot" :style="{ left: bodyData.exercise.progress + '%' }"></view>
          </view>

          <text class="footer-tip">{{ bodyData.exercise.tip }}</text>
        </view> -->

        <!-- ===== 账单卡片 ===== -->
        <!-- <bill></bill> -->

      </block>

      <!-- ================= 记事本页 ================= -->
      <block v-else-if="currentTab === 'notebook'">

        <!-- 无记录时的占位提示 -->
        <view v-if="notebookList.length === 0" class="notebook-placeholder">
          <text class="notebook-title">暂无记事记录</text>
          <text class="notebook-tip">
            开始为宠物记下生活点滴吧~
          </text>
        </view>

        <!-- 记事列表（两列卡片布局） -->
        <view v-else class="notebook-list">
          <view class="yearGroup" v-for="(year, index) in notebookList" :key="index">
            <view class="year-title">{{ year.year }}</view>
            <view v-for="(note, index) in year.records" :key="index" class="note-item">
              <view class="note-left">{{ note.write_month }}.{{ note.write_day }}</view>
              <view class="note-right">
                <view class="note-content">{{ note.content }}</view>
                <view v-if="note.picList.length > 0" class="picContainer">
                  <image class="note-image" :src="note.picList[0].url" mode="aspectFill" />
                </view>
              </view>
            </view>
          </view>

        </view>
      </block>

      <!-- 我的宠物弹出层 -->
      <uni-popup ref="myPetPopup" type="center" @maskClick="handleCloseMyPetPopup">
        <myPet :refresh-signal="refreshPetFlag" @close="handleCloseMyPetPopup" @clickPet="handelClickPet"></myPet>
      </uni-popup>

    </view>

    <!-- 底部占位（防止内容被遮挡） -->
    <!-- <view class="footer-placeholder"></view> -->

  </view>
</template>



<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import { onReady, onLoad, onShow } from '@dcloudio/uni-app'
import { weightChart } from "./components/weightChart.vue"
import { drinkChart } from "./components/drinkChart.vue"
import XEUtils from 'xe-utils'
import { usePetStore } from '@/store/pet'
const petCloudObj = uniCloud.importObject("client-pet", { customUI: true })
const writeCloudObj = uniCloud.importObject("client-record-write", { customUI: true })

const petStore = usePetStore()
// 我的宠物弹出层
const myPetPopup = ref(null)
// 刷新我的宠物信号
const refreshPetFlag = ref(false)
//我的宠物弹窗是否开启
const isMyPetPopopOpen = ref(false)
const weightChartRef = ref(null)
const drinkChartRef = ref(null)
const currentTab = ref('body')   // 当前 Tab（身体 / 记事本）
const isLoading = ref(false)      // 数据加载状态
// 选中的宠物
const selectedPet = computed(() => {
  return petStore.statisticCurrentPet
})

onShow(async () => {
  if (currentTab.value == 'notebook') {
    getNoteData()
  }
  else {
    if (XEUtils.isEmpty(selectedPet)) {
      await getFirstPet()
    }
    weightChartRef.value.refreshData()
    drinkChartRef.value.refreshData()
  }
})

const clickNoteTab = () => {
  currentTab.value = 'notebook'
  getNoteData()
}

const getNoteData = async () => {
  try {
    uni.showLoading({ title: '加载中' })
    const { errCode, data } = await writeCloudObj.list()
    if (errCode !== 0) {
      return uni.showToast({
        title: '获取记事数据失败',
        icon: 'none'
      })
    }
    notebookList.value = data
  } catch (err) {
    console.log(err)
  } finally {
    uni.hideLoading()
  }
}
//获得第一个宠物数据
const getFirstPet = async () => {
  //没有登录直接返回
  if (XEUtils.isEmpty(uni.getStorageSync('uni-id-pages-userInfo'))) return
  const { errCode, data } = await petCloudObj.getFirstPet()
  if (errCode !== 0) {
    return uni.showToast({
      title: '获取宠物数据失败',
      icon: 'none'
    })
  }
  petStore.setStatisticCurrentPet(data)
}

// 打开我的宠物弹出层
const openPetPopup = () => {
  isMyPetPopopOpen.value = true
  // 切换刷新信号，触发子组件重新加载
  refreshPetFlag.value = !refreshPetFlag.value
  myPetPopup.value.open()
}

// 关闭我的宠物弹出层
const handleCloseMyPetPopup = () => {
  myPetPopup.value.close()
  isMyPetPopopOpen.value = false
}

// 点击切换宠物
const handelClickPet = async (e) => {
  petStore.setStatisticCurrentPet(e)
  // getRecordData()
  handleCloseMyPetPopup()
}


// onLoad(() => {
//   fetchData()
// })

/* ====================================================
 * 页面状态
 * ==================================================== */




/* ====================================================
 * 账单数据
 * ==================================================== */
const billData = ref({
  currentMonthTotal: '¥1,248.00'
})

/* ====================================================
 * 记事本相关状态
 * ==================================================== */
const notebookList = ref([])      // 记事列表
const showNoteModal = ref(false)  // 弹窗显示状态
const newNoteContent = ref('')    // 输入内容


</script>


<style lang="scss">
.pet {
  padding: 20rpx 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;


}

.pet.name {
  margin-right: 20rpx;
}

.chart {
  height: 300px;
}

/* ====================================================================
 * 1. 基础设置与页面骨架 (Layout & Global Utilities)
 * ==================================================================== */

/* 基础色彩变量 */
.main-yellow {
  color: #FDD100;
}

.card-bg {
  background-color: #fff;
}

.text-dark {
  color: #333;
}

.text-light {
  color: #666;
}

/* 页面整体布局 */
.layout {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  /* padding-bottom: 120rpx; */
}

/* 底部占位符 */
.footer-placeholder {
  height: 120rpx;
}

/* 数据加载中提示 */
.loading-placeholder {
  padding: 40rpx;
  text-align: center;
  color: #999;
}

/* ====================================================================
 * 2. 头部 (Header)
 * ==================================================================== */

.header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20rpx 40rpx 0;
  position: relative;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.more-icon {
  position: absolute;
  right: 40rpx;
  font-size: 40rpx;
  color: #333;
}

/* ====================================================================
 * 3. 标签栏 (Tabs)
 * ==================================================================== */

.tabs-wrap {
  display: flex;
  justify-content: center;
  padding: 30rpx 0;
}

.tabs {
  display: flex;
  background-color: #fff;
  border-radius: 40rpx;
  padding: 10rpx;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
}

.tab {
  display: flex;
  align-items: center;
  padding: 10rpx 30rpx;
  margin: 0 10rpx;
  border-radius: 40rpx;
  color: #666;
  font-size: 28rpx;
  transition: all 0.2s;
}

.tab.active {
  background-color: #FDD100;
  color: #333;
  font-weight: bold;
}

.tab .circle {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  margin-right: 10rpx;
  border: 4rpx solid #fff;
  background-color: #FDD100;
}

.tab.active .circle {
  background-color: #000;
}

/* ====================================================================
 * 4. 内容卡片 (Content & Cards)
 * ==================================================================== */

.content {
  padding: 0 30rpx 50rpx;
}

.card {
  background-color: #fff;
  border-radius: 20rpx;
  border: 2rpx solid #333;
  padding: 30rpx;
  width: 100%;
  margin-bottom: 30rpx;
  overflow: hidden;
}

.chart-card {
  min-height: 250rpx;
}

.card-title-row {
  display: flex;
  align-items: center;
  position: relative;
  margin-bottom: 20rpx;
}

.icon-left {
  font-size: 40rpx;
  color: #FDD100;
  margin-right: 15rpx;
}

.chart-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.period {
  position: absolute;
  right: 0;
  font-size: 24rpx;
  color: #333;
  border: 1rpx solid #ccc;
  border-radius: 20rpx;
  padding: 4rpx 12rpx;
}

/* 账单卡片 */
.bill-jump-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #FDD100;
}

.bill-jump-card .title {
  font-size: 32rpx;
  font-weight: bold;
}

.bill-info {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  color: #333;
}

.bill-jump-card .value {
  font-size: 36rpx;
  font-weight: bold;
  margin-left: 10rpx;
}

.right-arrow {
  font-size: 36rpx;
  color: #333;
}

/* ====================================================================
 * 5. 图表区域 (Chart Display)
 * ==================================================================== */

.chart-container {
  height: 200rpx;
  border: 1rpx dashed #eee;
  margin-top: 10rpx;
  border-radius: 10rpx;
}

.chart-canvas {
  width: 100%;
  height: 260rpx;
}

.small-chart {
  height: 150rpx;
}

.placeholder-text {
  color: #999;
  font-size: 28rpx;
}

/* ====================================================================
 * 6. 运动评估 (Exercise Evaluation)
 * ==================================================================== */

.evaluation-card {
  padding: 40rpx 30rpx;
}

.evaluation-card .title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 40rpx;
}

.indicator {
  display: flex;
  justify-content: space-between;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.status.active {
  color: #5cb85c;
  font-weight: bold;
}

.progress-bar {
  height: 10rpx;
  position: relative;
  margin: 10rpx 0 30rpx;
}

.bar-bg {
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, #ccc, #5cb85c, #ff4444);
  border-radius: 5rpx;
}

.bar-dot {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 30rpx;
  height: 30rpx;
  border-radius: 50%;
  background-color: #FDD100;
  border: 4rpx solid #fff;
}

/* ====================================================================
 * 7. 记事本模块 (Notebook & Modal)
 * ==================================================================== */

/* 记事本占位 */
.notebook-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 500rpx;
  text-align: center;
}

.notebook-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.notebook-tip {
  font-size: 28rpx;
  color: #666;
}


/*记事列表（两列布局）*/
.notebook-list {
  display: flex;
  flex-direction: column;

  .yearGroup {
    .year-title {
      font-size: 34rpx;
      font-weight: 600;
      margin-bottom: 20rpx;
    }

    /*单条记事卡片*/
    .note-item {
      width: 100%;
      display: flex;
      justify-content: space-between;
      margin-bottom: 20rpx;

      .note-right {
        width: 80%;
        background-color: #fff;
        height: 200rpx;
        border-radius: 20rpx;
        padding: 20rpx;
        display: flex;
        justify-content: space-between;

        .picContainer {
          width: 160rpx;
          height: 160rpx;
          margin-left: 10rpx;

          .note-image {
            width: 100%;
            height: 100%;
          }
        }
      }
    }
  }



}




/*内容区域（可滚动）*/
.note-content {
  display: block;

  max-height: 120rpx;
  /* 控制内容显示区高度 */
  overflow-y: auto;
  /* 内容多时内部滚动 */
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
}


/* 滚动条弱化（小程序 WebView 有效） */
.note-content::-webkit-scrollbar {
  width: 6rpx;
}

.note-content::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.25);
  border-radius: 4rpx;
}


/* ===============================
 * 日期（固定在左下角）
 * =============================== */
.note-date {
  position: absolute;
  left: 20rpx;
  bottom: 14rpx;
  font-size: 22rpx;
  color: #999;
}


/* ====================================================================
 *  模态窗口 (Modal)
 * ==================================================================== */

.record-float-btn {
  position: fixed;
  right: 40rpx;
  bottom: 40rpx;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #55aaff;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 50rpx;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.2);
}

.note-modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.note-modal {
  width: 680rpx;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  box-sizing: border-box;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.modal-close {
  font-size: 36rpx;
  color: #999;
}

.textarea-shell {
  width: 100%;
  box-sizing: border-box;
  padding: 20rpx;
  border: 2rpx solid #000;
  border-radius: 15rpx;
  margin-bottom: 40rpx;
}

.note-textarea {
  width: 100%;
  height: 210rpx;
  border: none;
  padding: 0;
  font-size: 28rpx;
  line-height: 1.5;
  color: #333;
  background-color: transparent;

}

.note-textarea::placeholder {
  color: #999;
}

.complete-btn {
  width: 100%;
  padding: 20rpx 0;
  background-color: #55aaff;
  border-radius: 15rpx;
  text-align: center;
  font-size: 28rpx;
  color: #fff;
}
</style>
