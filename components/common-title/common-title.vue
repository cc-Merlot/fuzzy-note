<template>
  <view class="top">
    <view @click="uni.navigateBack()" class="back"><uni-icons type="left" size="24"></uni-icons></view>
    <view class="title">{{ title }}</view>
  </view>
</template>

<script setup>
const props = defineProps({
  title: {  //参数名
    type: String,  //参数类型
    default: '标题'  //默认值
  }
})
</script>

<style lang="scss" scoped>
.top {
  position: relative;
  padding-bottom: 30rpx;
  width: 100%;

  .back {
    position: absolute;
    top: 0;
    left: 30rpx;
  }

  .title {
    margin-top: 20rpx;
    text-align: center;
  }
}
</style>