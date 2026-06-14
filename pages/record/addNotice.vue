<template>
  <view class="layout backgound">
    <view class="pet">
      <status-bar />
      <common-title :title="editType + '任务'"></common-title>
      <view class="container">
        <view class="contentInput card">
          <uv-textarea v-model="param.content" placeholder="请输入内容" border="none" height="60"></uv-textarea>
        </view>
        <view @click="openTypePicker" class="type card">
          <view class="left">类型</view>
          <view class="right">
            <text class="txt">{{ typeName }}</text>
            <uni-icons type="right" size="18" color="#666"></uni-icons>
          </view>
        </view>
        <view @click="openTimePicker" class="type card">
          <view class="left">时间</view>
          <view class="right">
            <text class="txt">{{ param.time ? dayjs(param.time).format('YYYY年M月D日 dddd HH:mm') : '请选择' }}</text>
            <uni-icons type="right" size="18" color="#666"></uni-icons>
          </view>
        </view>

        <view class="addBtn">
          <button class="btn" @click="submitForm">添加</button>
        </view>
      </view>

      <!-- 类型选择器 -->
      <uv-picker ref="picker" :columns="columns" keyName="label" @confirm="confirmType"></uv-picker>
      <!-- 时间选择器 -->
      <uv-datetime-picker ref="datetimePicker" v-model="timeValue" mode="datetime" @confirm="confirmTime">
      </uv-datetime-picker>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { set } from 'xe-utils'
import dayjs from "dayjs";
import 'dayjs/locale/zh-cn'
import { useCalendarStore } from '@/store/calendar'
import { onLoad } from '@dcloudio/uni-app'

dayjs.locale('zh-cn')

const taskCloudObj = uniCloud.importObject("client-task", { customUI: true })
const calendarStore = useCalendarStore()

const param = ref({
  content: '',
  type: null,
  time: null
})
const typeName = ref('请选择')
const picker = ref(null)
const datetimePicker = ref(null)
const timeValue = ref(Date.now())
const editType = ref('添加')

const columns = [
  [{ label: '日常提醒', id: 1 },
  { label: '洗护提醒', id: 2 },
  { label: '清洁提醒', id: 3 },
  { label: '用药提醒', id: 4 }]
]

onLoad((e) => {
  let { _id } = e
  if (_id) {
    editType.value = '修改'
    getData(_id)
  }
})

const getData = async (_id) => {
  try {
    uni.showLoading({ title: '加载中' })
    const { errCode, data } = await taskCloudObj.detail(_id)
    if (errCode !== 0) return uni.showToast({ title: '获取数据失败', icon: 'none' })
    param.value = data
    typeName.value = columns[0][param.value.type - 1].label
  } catch (err) {
    console.log(err)
  } finally {
    uni.hideLoading()
  }

}
// 打开类型选择器
const openTypePicker = () => {
  picker.value.open();
}
// 打开时间选择器
const openTimePicker = () => {
  if (param.value.time) timeValue.value = param.value.time
  else timeValue.value = dateWithCurrentTimeSimple(calendarStore.recordCurrentDate)
  setTimeout(() => {
    datetimePicker.value.open()
  }, 100)
}

function dateWithCurrentTimeSimple(dateStr) {
  // 获取当前时间的时分秒
  const now = new Date();
  const currentTime = now.toTimeString().split(' ')[0]; // 格式: "22:56:30"

  // 直接拼接成ISO格式字符串
  const dateTimeStr = `${dateStr}T${currentTime}`;
  console.log(dateTimeStr)
  const date = new Date(dateTimeStr);
  return date.getTime();
}

const confirmType = (e) => {
  param.value.type = e.value[0].id
  typeName.value = e.value[0].label
}
const confirmTime = (e) => {
  console.log(e)
  param.value.time = e.value
}

const submitForm = async () => {
  try {
    if (!param.value.content) return uni.showToast({ title: '请输入内容', icon: 'none' })
    if (!param.value.type) return uni.showToast({ title: '请选择类型', icon: 'none' })
    if (!param.value.time) return uni.showToast({ title: '请选择时间', icon: 'none' })

    uni.showLoading({ title: '加载中' })
    const { errCode, data } = param.value._id ? await taskCloudObj.update(param.value) : await taskCloudObj.add(param.value)
    if (errCode !== 0) return uni.showToast({ title: editType.value + '失败', icon: 'none' })
    // 先显示成功提示
    uni.showToast({
      title: editType.value + '成功',
      icon: 'none',
      duration: 1500
    });
    // 延迟返回，让用户看到提示
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/record/record?clickType=0' })
    }, 1500);
  } catch (err) {
    console.log(err)
    uni.showToast({ title: editType.value + '失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }

}
</script>

<style lang="scss" scoped>
.card {
  background-color: #fff;
  border: 3rpx solid #000;
  border-radius: 30rpx;
}

.container {
  padding: 30rpx;

  .contentInput {

    width: 100%;
    overflow: hidden;
  }

  .type {
    margin-top: 20rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20rpx;
    height: 100rpx;

    .right {
      display: flex;
      align-items: center;

      .txt {
        font-size: 26rpx;
        color: #666;
        margin-right: 10rpx;
      }
    }


  }

  .addBtn {
    margin-top: 40rpx;

    .btn {
      background-color: #ffeb3b;
      border: 3rpx solid #000;
      border-radius: 50rpx;
    }
  }
}
</style>