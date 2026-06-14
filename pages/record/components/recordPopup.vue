<template>
  <view class="content">
    <view class="top">
      <view class="title">{{ titleList[recordType] }}</view>
      <view @click="close" class="close"><uni-icons type="closeempty" size="20"></uni-icons></view>
    </view>

    <!-- 饮食 -->
    <view v-if="recordType == 0" class="eatContainer">
      <view class="item">
        <text>食物名称：</text>
        <view class="eat"><input v-model="eatParam.food_name" class="foodInput" placeholder="请输入"><text></text>
        </view>
      </view>
      <view class="item">
        <text>食物重量：</text>
        <view class="eat"><input v-model.number="eatParam.food_weight" class="input" placeholder="请输入"
            type="number"><text>g</text>
        </view>
      </view>
    </view>
    <!-- 喝水 -->
    <view class="drinkContainer" v-if="recordType == 1">
      <view class="drink">
        <input v-model.number="drinkParam.volume" class="input" placeholder="请输入" type="number"><text>ml</text>
      </view>
    </view>
    <!-- 称重 -->
    <view v-if="recordType == 2" class="weight">
      <view class="tip">小tips:建议您在早晨、每天的同一时间或第一餐前为宠物称重</view>
      <view class="data">
        <input v-model="weightParam.weight" @input="weightParam.weight = parseFloat(weightParam.weight)" class="input"
          placeholder="请输入" type="digit"><text>kg</text>
      </view>
    </view>

    <!-- 洗护 -->
    <view class="wash" v-if="recordType == 3">

      <view class="washItem" v-for="(item, index) in washList" :key="index" @click="onClickWash(item, index)"
        :class="{ active: washParam.washList.includes(index + 1) }">
        <view class="icon"><text class="iconfont" :class="item.icon"></text></view>
        <view class="text">{{ item.name }}</view>
      </view>
    </view>

    <!-- 卫生 -->
    <view class="health" v-if="recordType == 4">
      <view class="healthContent shit">
        <view class="title"><text class="iconfont2 iconx-bianbian1"></text>粑粑</view>
        <view class="selection">
          <view class="item" @click="healthParam.shitStatus = index + 1" v-for="(item, index) in shitList" :key="index"
            :style="{ backgroundColor: item.color }">
            {{ item.name }}
            <view class="chose" v-if="healthParam.shitStatus == index + 1"><text class="iconfont icon-wancheng-copy"
                :class="item.icon"></text>
            </view>
          </view>
        </view>
      </view>

      <view class="healthContent pee">
        <view class="title"><text class="iconfont2 iconx-shuidi"></text>嘘嘘</view>
        <view class="selection">
          <view class="item" @click="healthParam.peeStatus = index + 1" v-for="(item, index) in peeList" :key="index"
            :style="{ backgroundColor: item.color }">
            {{ item.name }}
            <view class="chose" v-if="healthParam.peeStatus == index + 1"><text class="iconfont icon-wancheng-copy"
                :class="item.icon"></text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 记事 -->
    <view class="write" v-if="recordType == 5">
      <uni-easyinput :styles="{ height: '150px' }" type="textarea" v-model="writeParam.content"
        placeholder="(今天发生了什么事情呢~)" :maxlength="-1"></uni-easyinput>
      <view class="uploadPic">
        <multi-image-upload v-model="writeParam.picList" />
      </view>
    </view>
    <!-- 运动 -->
    <view class="drinkContainer" v-if="recordType == 6">
      <view class="drink">
        <input v-model.number="sportsParam.sport_time" class="input" placeholder="请输入" type="number"><text>min</text>
      </view>
    </view>


    <button @click="finishRecord" class="finish">完成记录</button>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import XEUtils from 'xe-utils'
import { usePetStore } from '@/store/pet'
import { useCalendarStore } from '@/store/calendar'
import { useRecordStore } from '@/store/record'

const petStore = usePetStore()
const recordStore = useRecordStore()
const calendarStore = useCalendarStore()
const drinkCloudObj = uniCloud.importObject("client-record-drink", { customUI: true })
const weightCloudObj = uniCloud.importObject("client-record-weight", { customUI: true })
const washCloudObj = uniCloud.importObject("client-record-wash", { customUI: true })
const writeCloudObj = uniCloud.importObject("client-record-write", { customUI: true })
const sportsCloudObj = uniCloud.importObject("client-record-sports", { customUI: true })
const healthCloudObj = uniCloud.importObject("client-record-health", { customUI: true })
const eatCloudObj = uniCloud.importObject("client-record-eat", { customUI: true })


const props = defineProps({
  recordType: {  //参数名
    type: Number,  //参数类型
    default: 0  //默认值
  }
})


const emit = defineEmits(['close'])


const washList = ref([
  { name: '梳毛', icon: 'icon-shuzi' },
  { name: '洗澡', icon: 'icon-xizao' },
  { name: '驱虫', icon: 'icon-yaopian' },
  { name: '剪指甲', icon: 'icon-jianzhijia' },
  { name: '清耳', icon: 'icon-erduo' },
  { name: '刷牙', icon: 'icon-yachi' }
])

//便便列表
const shitList = ref([
  { name: '干硬', color: '#3e2723' },
  { name: '完美', color: '#8b4513' },
  { name: '软便', color: '#c7a130' },
  { name: '拉稀', color: '#ffca28' }
])

//尿尿列表
const peeList = ref([
  { name: '健康', color: '#fce863' },
  { name: '缺水', color: '#ff9800' },
  { name: '血尿', color: '#ff5252' },
  { name: '透明', color: '#e1f5fe' }
])

const titleList = ['记录饮食', '摄入水量', '今日体重', '洗护项目', '卫生情况', '记事', '运动时间']

// 运动数据响应式引用，用于输入框绑定
const eatParam = ref({
  food_name: '',
  food_weight: 0,
  eat_date: null,
  pet_id: ''
})

// 喝水数据响应式引用，用于输入框绑定
const drinkParam = ref({
  volume: 0,
  drink_date: null,
  pet_id: ''
})

// 体重数据响应式引用，用于输入框绑定
const weightParam = ref({})

// 洗护数据响应式引用，用于输入框绑定
const washParam = ref({
  washList: [],
  wash_date: null,
  pet_id: ''
})
// 洗护项目是否选中
const washChoseList = ref([false, false, false, false, false, false])

// 卫生数据响应式引用，用于输入框绑定
const healthParam = ref({
  shitStatus: null,
  peeStatus: null,
  health_date: null,
  pet_id: ''
})

// 记事数据响应式引用，用于输入框绑定
const writeParam = ref({
  content: '',
  picList: [],
  write_date: null,
  pet_id: ''
})

// 运动数据响应式引用，用于输入框绑定
const sportsParam = ref({
  sport_time: null,
  sport_date: null,
  pet_id: ''
})

watch(() => recordStore.eatData, (newVal) => {
  eatParam.value.food_name = newVal?.food_name || ''
  eatParam.value.food_weight = newVal?.food_weight || null
  eatParam.value._id = newVal?._id
}, { immediate: true })

// 监听 store 变化，更新输入框的值
watch(() => recordStore.drinkData, (newVal) => {
  drinkParam.value.volume = newVal?.volume || null
  drinkParam.value._id = newVal?._id
}, { immediate: true }) // immediate: true 初始化时立即执行一次


watch(() => recordStore.weightData, (newVal) => {
  weightParam.value.weight = newVal?.weight || null
  weightParam.value._id = newVal?._id
}, { immediate: true })

watch(() => recordStore.washList, (newVal) => {
  washParam.value.washList = newVal?.washList || []
  washParam.value._id = newVal?._id
}, { immediate: true })

watch(() => recordStore.washList, (newVal) => {
  washChoseList.value = [false, false, false, false, false, false]
  if (XEUtils.isEmpty(newVal) || XEUtils.isEmpty(newVal.washList)) return
  newVal.washList.map(item => washChoseList.value[item - 1] = true)
}, { immediate: true })

watch(() => recordStore.writeData, (newVal) => {
  writeParam.value.content = newVal?.content || ''
  writeParam.value.picList = newVal?.picList || []
  writeParam.value._id = newVal?._id
}, { immediate: true })

watch(() => recordStore.sportsData, (newVal) => {
  sportsParam.value.sport_time = newVal?.sport_time || null
  sportsParam.value._id = newVal?._id
}, { immediate: true })

watch(() => recordStore.healthData, (newVal) => {
  healthParam.value.shitStatus = newVal?.shitStatus || null
  healthParam.value.peeStatus = newVal?.peeStatus || null
  healthParam.value._id = newVal?._id
}, { immediate: true })

const onKeyInput = (e) => {
  console.log(e)
}
// 点击洗护
const onClickWash = (item, index) => {
  washChoseList.value[index] = !washChoseList.value[index]
  // 使用 reduce 获取选中项的索引
  washParam.value.washList = washChoseList.value.reduce((result, item, index) => {
    if (item) {
      result.push(index + 1)
    }
    return result
  }, [])
}
// 关闭
const close = () => {
  emit('close')
}

// 完成记录
const finishRecord = async () => {
  if (props.recordType == 0) {
    // 饮食
    try {
      uni.showLoading({ title: '加载中...' })
      if (eatParam.value._id) {
        //更新
        let tempParam = { _id: eatParam.value._id, food_name: eatParam.value.food_name, food_weight: eatParam.value.food_weight }
        let { errCode, data } = await eatCloudObj.update(tempParam)
        if (errCode !== 0) return uni.showToast({ title: '记录失败', icon: 'none' })
        recordStore.setEatData(tempParam)
      } else {
        //添加
        eatParam.value.eat_date = calendarStore.recordCurrentDate
        eatParam.value.pet_id = petStore.recordCurrentPet._id
        let { errCode, data } = await eatCloudObj.add(eatParam.value)
        if (errCode !== 0) return uni.showToast({ title: '记录失败', icon: 'none' })
        recordStore.setEatData({ food_name: eatParam.value.food_name, food_weight: eatParam.value.food_weight, _id: data.id })
      }
      uni.showToast({ title: '记录成功', icon: 'none' })
      setTimeout(() => {
        emit('close')
      }, 500)

    } catch (err) {
      uni.showToast({ title: '记录失败', icon: 'none' })
    } finally {
      uni.hideLoading()
    }
  }
  else if (props.recordType == 1) {
    // 喝水
    try {
      uni.showLoading({ title: '加载中...' })
      if (drinkParam.value._id) {
        //更新
        let { errCode, data } = await drinkCloudObj.update({ _id: drinkParam.value._id, volume: drinkParam.value.volume })
        if (errCode !== 0) return uni.showToast({ title: '记录失败', icon: 'none' })
        recordStore.setDrinkVolum({ volume: drinkParam.value.volume, _id: drinkParam.value._id })
      } else {
        //添加
        drinkParam.value.drink_date = calendarStore.recordCurrentDate
        drinkParam.value.pet_id = petStore.recordCurrentPet._id
        let { errCode, data } = await drinkCloudObj.add(drinkParam.value)
        if (errCode !== 0) return uni.showToast({ title: '记录失败', icon: 'none' })
        recordStore.setDrinkVolum({ volume: drinkParam.value.volume, _id: data.id })
      }
      uni.showToast({ title: '记录成功', icon: 'none' })
      setTimeout(() => {
        emit('close')
      }, 500)

    } catch (err) {
      uni.showToast({ title: '记录失败', icon: 'none' })
    } finally {
      uni.hideLoading()
    }
  }
  else if (props.recordType == 2) {
    // 体重
    try {
      uni.showLoading({ title: '加载中...' })
      if (weightParam.value._id) {
        //更新
        let { errCode, data } = await weightCloudObj.update({ _id: weightParam.value._id, weight: weightParam.value.weight })
        if (errCode !== 0) return uni.showToast({ title: '记录失败', icon: 'none' })
        recordStore.setWeightData({ weight: weightParam.value.weight, _id: weightParam.value._id })
      } else {
        //添加
        weightParam.value.weight_date = calendarStore.recordCurrentDate
        weightParam.value.pet_id = petStore.recordCurrentPet._id
        let { errCode, data } = await weightCloudObj.add(weightParam.value)
        if (errCode !== 0) return uni.showToast({ title: '记录失败', icon: 'none' })
        recordStore.setWeightData({ weight: weightParam.value.weight, _id: data.id })
      }
      uni.showToast({ title: '记录成功', icon: 'none' })
      setTimeout(() => {
        emit('close')
      }, 500)

    } catch (err) {
      uni.showToast({ title: '记录失败', icon: 'none' })
    } finally {
      uni.hideLoading()
    }
  }
  else if (props.recordType == 3) {
    // 洗护
    try {
      uni.showLoading({ title: '加载中...' })
      if (washParam.value._id) {
        //更新
        let { errCode, data } = await washCloudObj.update({ _id: washParam.value._id, washList: washParam.value.washList })
        if (errCode !== 0) return uni.showToast({ title: '记录失败', icon: 'none' })
        recordStore.setWashList({ washList: washParam.value.washList, _id: washParam.value._id })
      } else {
        //添加
        washParam.value.wash_date = calendarStore.recordCurrentDate
        washParam.value.pet_id = petStore.recordCurrentPet._id
        let { errCode, data } = await washCloudObj.add(washParam.value)
        if (errCode !== 0) return uni.showToast({ title: '记录失败', icon: 'none' })
        recordStore.setWashList({ washList: washParam.value.washList, _id: data.id })
      }
      uni.showToast({ title: '记录成功', icon: 'none' })
      setTimeout(() => {
        emit('close')
      }, 500)

    } catch (err) {
      uni.showToast({ title: '记录失败', icon: 'none' })
    } finally {
      uni.hideLoading()
    }
  }
  else if (props.recordType == 4) {
    // 卫生
    try {
      uni.showLoading({ title: '加载中...' })
      if (healthParam.value.shitStatus == null && healthParam.value.peeStatus == null)
        return uni.showToast({ title: '至少选择一项', icon: 'none' })
      if (healthParam.value._id) {
        //更新
        let tempParam = { _id: healthParam.value._id, peeStatus: healthParam.value.peeStatus, shitStatus: healthParam.value.shitStatus }
        let { errCode, data } = await healthCloudObj.update(tempParam)
        if (errCode !== 0) return uni.showToast({ title: '记录失败', icon: 'none' })
        recordStore.setHealthData(tempParam)
      } else {
        //添加
        healthParam.value.health_date = calendarStore.recordCurrentDate
        healthParam.value.pet_id = petStore.recordCurrentPet._id
        let { errCode, data } = await healthCloudObj.add(healthParam.value)
        if (errCode !== 0) return uni.showToast({ title: '记录失败', icon: 'none' })
        recordStore.setHealthData({ peeStatus: healthParam.value.peeStatus, shitStatus: healthParam.value.shitStatus, _id: data.id })
      }
      uni.showToast({ title: '记录成功', icon: 'none' })
      setTimeout(() => {
        emit('close')
      }, 500)

    } catch (err) {
      uni.showToast({ title: '记录失败', icon: 'none' })
    } finally {
      uni.hideLoading()
    }
  }
  else if (props.recordType == 5) {
    // 记事
    try {
      uni.showLoading({ title: '加载中...' })
      if (writeParam.value._id) {
        //更新
        let tempParam = { _id: writeParam.value._id, content: writeParam.value.conntet, picList: writeParam.value.picList }
        let { errCode, data } = await writeCloudObj.update(tempParam)
        if (errCode !== 0) return uni.showToast({ title: '记录失败', icon: 'none' })
        recordStore.setWriteData(tempParam)
      } else {
        //添加
        writeParam.value.write_date = calendarStore.recordCurrentDate
        writeParam.value.pet_id = petStore.recordCurrentPet._id
        let { errCode, data } = await writeCloudObj.add(writeParam.value)
        if (errCode !== 0) return uni.showToast({ title: '记录失败', icon: 'none' })
        recordStore.setWriteData({ content: writeParam.value.content, _id: data.id, picList: writeParam.value.picList })
      }
      uni.showToast({ title: '记录成功', icon: 'none' })
      setTimeout(() => {
        emit('close')
      }, 500)

    } catch (err) {
      uni.showToast({ title: '记录失败', icon: 'none' })
    } finally {
      uni.hideLoading()
    }
  }
  else if (props.recordType == 6) {
    // 运动
    try {
      uni.showLoading({ title: '加载中...' })
      if (sportsParam.value._id) {
        //更新
        let tempParam = { _id: sportsParam.value._id, sport_time: sportsParam.value.sport_time }
        let { errCode, data } = await sportsCloudObj.update(tempParam)
        if (errCode !== 0) return uni.showToast({ title: '记录失败', icon: 'none' })
        recordStore.setSportsData(tempParam)
      } else {
        //添加
        sportsParam.value.sport_date = calendarStore.recordCurrentDate
        sportsParam.value.pet_id = petStore.recordCurrentPet._id
        let { errCode, data } = await sportsCloudObj.add(sportsParam.value)
        if (errCode !== 0) return uni.showToast({ title: '记录失败', icon: 'none' })
        recordStore.setSportsData({ sport_time: sportsParam.value.sport_time, _id: data.id })
      }
      uni.showToast({ title: '记录成功', icon: 'none' })
      setTimeout(() => {
        emit('close')
      }, 500)

    } catch (err) {
      uni.showToast({ title: '记录失败', icon: 'none' })
    } finally {
      uni.hideLoading()
    }
  }
}
</script>

<style lang="scss" scoped>
.content {
  width: 100%;
  background-color: #fff;
  border-radius: 30rpx 30rpx 0 0;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;

  .top {
    display: flex;
    justify-content: space-between;
    width: 100%;

    .title {
      font-size: 36rpx;
      font-weight: 600;
      margin-bottom: 40rpx;
    }
  }

  .weight {
    display: flex;
    flex-direction: column;
    align-items: center;

    .tip {
      font-size: 26rpx;
    }

    .data {
      display: flex;
      width: 300rpx;
      height: 70rpx;
      background-color: #e8e8e8;
      margin: 60rpx 0;
      border-radius: 18rpx;
      padding: 10rpx 30rpx;
      justify-content: center;

      .input {
        width: 120rpx;
      }
    }
  }

  .wash {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-column-gap: 120rpx;
    grid-row-gap: 50rpx;
    width: 100%;
    padding-bottom: 20rpx;

    .washItem {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .icon {
        border: 3rpx solid #666;
        border-radius: 20rpx;
        width: 100%;
        height: 100rpx;
        display: flex;
        align-items: center;
        justify-content: center;

        .iconfont {
          color: #2f88ff;
          font-size: 50rpx;
        }

      }
    }

    .washItem.active {
      .icon {
        border: 3rpx solid #000;
        background: #ffeb3b;
      }
    }
  }

  .health {
    width: 100%;
    padding: 0 30rpx;

    .healthContent {
      width: 100%;
      margin-bottom: 30rpx;

      .title {
        margin-bottom: 20rpx;

        .iconfont2 {
          margin-right: 5rpx;
        }
      }

      .selection {
        display: flex;
        justify-content: space-between;
        align-items: center;


        .item {
          width: 100rpx;
          height: 100rpx;
          border-radius: 20rpx;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;

          .chose {
            position: absolute;
            bottom: -2rpx;
            right: -2rpx;
            color: #4cd964
          }
        }
      }
    }
  }

  .eatContainer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .item {
      display: flex;
      align-items: center;

      .eat {
        display: flex;
        width: 300rpx;
        height: 70rpx;
        background-color: #e8e8e8;
        margin: 20rpx 0;
        border-radius: 18rpx;
        padding: 10rpx 30rpx;
        justify-content: center;


        .foodInput {
          width: 200rpx;
        }

        .input {
          width: 120rpx;
        }
      }
    }


  }

  .drinkContainer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .drink {
      display: flex;
      width: 300rpx;
      height: 70rpx;
      background-color: #e8e8e8;
      margin: 60rpx 0;
      border-radius: 18rpx;
      padding: 10rpx 30rpx;
      justify-content: center;


      .input {
        width: 120rpx;
      }
    }
  }


  .write {
    width: 100%;
    padding: 0 30rpx;

    :deep(.uni-textarea-wrapper) {
      min-height: 300rpx !important;
    }

    .uploadPic {
      margin-top: 20rpx;

      .title {
        margin-bottom: 10rpx;
      }
    }
  }


  .numberSlider {
    margin-top: 30rpx;
    width: 500rpx;
    height: 200rpx;
    background-color: #e8e8e8;
    border-radius: 20rpx;
    padding: 30rpx 20rpx;

    .value {
      font-size: 36rpx;
      text-align: center;
    }
  }

  .finish {
    margin-top: 30rpx;
    background-color: #ffeb3b;
    border: 3rpx solid #000;
    border-radius: 20rpx;
    width: 400rpx;
    height: 80rpx;
    line-height: 80rpx;
  }

}
</style>