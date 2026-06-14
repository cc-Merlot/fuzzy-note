<template>
  <view class="container">
    <!-- 加载状态 -->
    <view v-if="loading" class="loading">
      <text>加载饮水数据中...</text>
    </view>

    <!-- 空状态 -->
    <view v-else-if="isEmpty" class="empty">
      <text>暂无饮水记录数据</text>
      <text class="tip">开始记录宠物饮水，查看变化趋势</text>
    </view>

    <!-- 图表容器 -->
    <view v-else class="chart-container">
      <uni-echarts force-use-old-canvas="false" ref="drinkChart" custom-class="chart" :option="option"
        :loading="loading" @complete="onChartComplete" />
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
// import * as echarts from 'echarts'
// import { provideEcharts } from "@/uni_modules/xiaohe-echarts"

import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { LabelLayout } from 'echarts/features'
import { provideEcharts } from "@/uni_modules/xiaohe-echarts"
import { usePetStore } from '@/store/pet'
import XEUtils from 'xe-utils'

const petStore = usePetStore()

// 注册必要的组件
echarts.use([
  LineChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  CanvasRenderer,
  LabelLayout
])


// 修改为饮水记录的云对象
const drinkCloudObj = uniCloud.importObject("client-record-drink", { customUI: true })

// 初始化 echarts
provideEcharts(echarts)

// 图表配置 - 调整为饮水数据
const option = ref({
  // 网格
  grid: {
    left: '10%',
    right: '10%',
    bottom: '15%',
    top: '20%',
    containLabel: true
  },

  tooltip: {
    show: true,
    trigger: 'axis',
  },

  // X轴（日期）
  xAxis: {
    type: 'category',
    boundaryGap: false, // 不留白，从y轴开始
    axisLine: {
      lineStyle: {
        color: '#e8e8e8'
      }
    },
    axisTick: {
      alignWithLabel: true
    },
    axisLabel: {
      color: '#666',
      fontSize: 12,
      formatter: function (value) {
        // 只显示日期的日部分，避免重叠
        return value.split('-')[2] + '日'
      }
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: '#f5f5f5',
        type: 'dashed'
      }
    },
    data: [] // 动态设置
  },

  // Y轴（饮水量）
  yAxis: {
    type: 'value',
    name: '饮水量(ml)',
    nameTextStyle: {
      color: '#666',
      fontSize: 12,
      padding: [0, 0, 0, 10]
    },
    axisLine: {
      show: true,
      lineStyle: {
        color: '#e8e8e8'
      }
    },
    axisTick: {
      show: true
    },
    axisLabel: {
      color: '#666',
      fontSize: 12,
      formatter: '{value}'
    },
    splitLine: {
      lineStyle: {
        color: '#f5f5f5',
        type: 'solid'
      }
    },
    min: 0, // 饮水量不会为负数
    max: function (value) {
      // 动态设置Y轴最大值，留出一些空间
      return Math.ceil(value.max * 1.2)
    }
  },

  // 系列数据
  series: [
    {
      name: '饮水量',
      type: 'line',
      smooth: true, // 平滑曲线
      symbol: 'circle', // 数据点形状
      symbolSize: 8, // 数据点大小
      showSymbol: true, // 显示数据点
      itemStyle: {
        color: '#1890ff', // 数据点颜色
        borderColor: '#fff',
        borderWidth: 2
      },
      lineStyle: {
        width: 3,
        color: '#1890ff' // 线条颜色
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: 'rgba(24, 144, 255, 0.3)'
          },
          {
            offset: 1,
            color: 'rgba(24, 144, 255, 0.05)'
          }
        ])
      },
      emphasis: {
        focus: 'series',
        itemStyle: {
          borderColor: '#000',
          borderWidth: 3,
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.3)'
        }
      },
      markPoint: {
        data: [
          { type: 'max', name: '最高', symbolSize: 50 },
          { type: 'min', name: '最低', symbolSize: 50 }
        ],
        label: {
          color: '#fff',
          fontSize: 12
        },
        itemStyle: {
          color: '#1890ff'
        }
      },
      markLine: {
        data: [
          { type: 'average', name: '平均值' }
        ],
        label: {
          color: '#666',
          fontSize: 12
        }
      },
      data: [] // 动态设置
    }
  ]
})

// 响应式数据
const loading = ref(true)
const isEmpty = ref(false)
const drinkChart = ref(null)

// 统计信息
const statistics = reactive({
  currentVolume: 0,      // 当前饮水量
  totalVolume: 0,        // 总饮水量
  recordDays: 0,         // 记录天数
  maxVolume: 0,          // 最大饮水量
  minVolume: 0,          // 最小饮水量
  avgVolume: 0,          // 平均饮水量
  latestDate: ''         // 最近记录日期
})

// 日期范围
const dateRange = reactive({
  startDate: '',
  endDate: ''
})

// 获取饮水数据
const fetchDrinkData = async () => {
  if (XEUtils.isEmpty(petStore.statisticCurrentPet)) {
    loading.value = false
    isEmpty.value = true
    return
  }
  loading.value = true
  isEmpty.value = false

  try {
    // 获取数据 - 假设云函数名称为 getDrinkStatistic 或类似
    // 如果云函数名称不同，请根据实际情况修改
    const result = await drinkCloudObj.getStatistic(petStore.statisticCurrentPet._id)

    if (result.errCode === 0 && result.data) {
      const records = result.data

      if (records.length === 0) {
        isEmpty.value = true
        loading.value = false
        return
      }

      // 按日期排序，确保时间顺序正确
      const sortedRecords = records.sort((a, b) => {
        return new Date(a.drink_date) - new Date(b.drink_date)
      })

      // 提取日期和饮水量数据
      const dates = sortedRecords.map(record => record.drink_date)
      const volumes = sortedRecords.map(record => record.volume)

      // 设置日期范围
      if (dates.length > 0) {
        dateRange.startDate = dates[0]
        dateRange.endDate = dates[dates.length - 1]
      }

      // 更新图表数据
      option.value.xAxis.data = dates
      option.value.series[0].data = volumes

      // 计算统计信息
      calculateStatistics(sortedRecords)

      // 更新状态
      isEmpty.value = false

    } else {
      isEmpty.value = true
    }

  } catch (error) {
    console.error('获取饮水数据失败:', error)
    isEmpty.value = true
  } finally {
    loading.value = false
  }
}

// 计算统计信息
const calculateStatistics = (records) => {
  if (!records || records.length === 0) {
    return
  }

  const volumes = records.map(record => record.volume)
  const validVolumes = volumes.filter(v => v != null && v >= 0)

  statistics.recordDays = validVolumes.length
  statistics.currentVolume = validVolumes[validVolumes.length - 1] || 0
  statistics.maxVolume = Math.max(...validVolumes)
  statistics.minVolume = Math.min(...validVolumes)
  statistics.totalVolume = validVolumes.reduce((a, b) => a + b, 0)
  statistics.avgVolume = Math.round(statistics.totalVolume / validVolumes.length)

  // 记录最近日期
  if (records.length > 0) {
    statistics.latestDate = records[records.length - 1].drink_date
  }

  // 如果需要计算变化趋势，可以添加以下逻辑
  // if (validVolumes.length >= 2) {
  //   const firstVolume = validVolumes[0]
  //   const lastVolume = validVolumes[validVolumes.length - 1]
  //   statistics.volumeChange = lastVolume - firstVolume
  // }
}

// 图表渲染完成回调
const onChartComplete = (e) => {
  console.log('饮水图表渲染完成')
  if (e.detail && e.detail.chart) {
    // 可以保存图表实例供后续使用
    const chartInstance = e.detail.chart

    // 监听页面显示/隐藏，重新调整图表大小
    uni.onWindowResize(() => {
      chartInstance.resize()
    })
  }
}

// 刷新数据
const refreshData = () => {
  fetchDrinkData()
}

// 页面加载时获取数据
onMounted(() => {
  fetchDrinkData()
})

// 导出方法供父组件调用
defineExpose({
  refreshData,
  statistics, // 导出统计信息
  dateRange   // 导出日期范围
})
</script>

<style scoped>
.chart-container {
  z-index: 1;
  width: 100%;
  height: 520rpx;
  background: #fff;
  border-radius: 16rpx;
}

.loading,
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400rpx;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
}

.loading text,
.empty text {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 16rpx;
}

.empty .tip {
  font-size: 24rpx;
  color: #ccc;
}
</style>