<template>
  <view class="container">
    <!-- 加载状态 -->
    <view v-if="loading" class="loading">
      <text>加载体重数据中...</text>
    </view>

    <!-- 空状态 -->
    <view v-else-if="isEmpty" class="empty">
      <text>暂无体重记录数据</text>
      <text class="tip">开始记录宠物体重，查看变化趋势</text>
    </view>

    <!-- 图表容器 -->
    <view v-else class="chart-container">
      <uni-echarts force-use-old-canvas="false" ref="weightChart" custom-class="chart" :option="option"
        :loading="loading" @complete="onChartComplete" />
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
// 按需引入 echarts 核心和所需组件
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, MarkPointComponent, MarkLineComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { LabelLayout } from 'echarts/features'
import { provideEcharts } from "@/uni_modules/xiaohe-echarts"

// 注册需要的组件
echarts.use([
  LineChart,
  GridComponent,
  TooltipComponent,
  MarkPointComponent,
  MarkLineComponent,
  CanvasRenderer,
  LabelLayout
])

// 引入 store 和工具库
import { usePetStore } from '@/store/pet'
import XEUtils from 'xe-utils'

const petStore = usePetStore()
const weightCloudObj = uniCloud.importObject("client-record-weight", { customUI: true })

// 初始化 echarts
provideEcharts(echarts)

// 图表配置
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
    boundaryGap: false,
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
    data: []
  },

  // Y轴（体重）
  yAxis: {
    type: 'value',
    name: '体重(kg)',
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
    min: function (value) {
      return Math.floor(value.min * 0.95 * 10) / 10
    },
    max: function (value) {
      return Math.ceil(value.max * 1.05 * 10) / 10
    }
  },

  // 系列数据
  series: [
    {
      name: '体重',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      showSymbol: true,
      itemStyle: {
        color: '#1890ff',
        borderColor: '#fff',
        borderWidth: 2
      },
      lineStyle: {
        width: 3,
        color: '#1890ff'
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
      data: []
    }
  ]
})

// 响应式数据
const loading = ref(true)
const isEmpty = ref(false)
const weightChart = ref(null)

// 统计信息
const statistics = reactive({
  currentWeight: 0,
  weightChange: 0,
  recordDays: 0,
  maxWeight: 0,
  minWeight: 0,
  avgWeight: 0,
  latestDate: ''  // 添加最近记录日期
})

// 日期范围
const dateRange = reactive({
  startDate: '',
  endDate: ''
})

// 获取体重数据
const fetchWeightData = async () => {
  // 检查当前选中的宠物
  if (XEUtils.isEmpty(petStore.statisticCurrentPet)) {
    loading.value = false
    isEmpty.value = true
    return
  }

  loading.value = true
  isEmpty.value = false

  try {
    // 获取体重统计数据
    const result = await weightCloudObj.getStatistic(petStore.statisticCurrentPet._id)

    if (result.errCode === 0 && result.data) {
      const records = result.data

      if (records.length === 0) {
        isEmpty.value = true
        loading.value = false
        return
      }

      // 按日期排序，确保时间顺序正确
      const sortedRecords = records.sort((a, b) => {
        return new Date(a.weight_date) - new Date(b.weight_date)
      })

      // 提取日期和体重数据
      const dates = sortedRecords.map(record => record.weight_date)
      const weights = sortedRecords.map(record => record.weight)

      // 设置日期范围
      if (dates.length > 0) {
        dateRange.startDate = dates[0]
        dateRange.endDate = dates[dates.length - 1]
      }

      // 更新图表数据
      option.value.xAxis.data = dates
      option.value.series[0].data = weights

      // 计算统计信息
      calculateStatistics(sortedRecords)

      // 更新状态
      isEmpty.value = false

    } else {
      isEmpty.value = true
    }

  } catch (error) {
    console.error('获取体重数据失败:', error)
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

  const weights = records.map(record => record.weight)
  const validWeights = weights.filter(w => w != null && w >= 0)

  statistics.recordDays = validWeights.length
  statistics.currentWeight = validWeights[validWeights.length - 1] || 0
  statistics.maxWeight = Math.max(...validWeights)
  statistics.minWeight = Math.min(...validWeights)
  statistics.avgWeight = Math.round((validWeights.reduce((a, b) => a + b, 0) / validWeights.length) * 10) / 10

  // 记录最近日期
  if (records.length > 0) {
    statistics.latestDate = records[records.length - 1].weight_date
  }

  // 计算变化趋势（最后一天 - 第一天）
  if (validWeights.length >= 2) {
    statistics.weightChange = Math.round((validWeights[validWeights.length - 1] - validWeights[0]) * 10) / 10
  }
}

// 图表渲染完成回调
const onChartComplete = (e) => {
  console.log('体重图表渲染完成')
  if (e.detail && e.detail.chart) {
    const chartInstance = e.detail.chart

    // 监听页面显示/隐藏，重新调整图表大小
    uni.onWindowResize(() => {
      chartInstance.resize()
    })
  }
}

// 刷新数据
const refreshData = () => {
  fetchWeightData()
}

// 页面加载时获取数据
onMounted(() => {
  fetchWeightData()
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