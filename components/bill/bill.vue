<template>
    <view class="layout">
        <view class="bill-detail-page">

            <!-- 主要内容卡片 -->
            <view class="card bill-chart-card">
                <view class="bill-pie-and-list-vertical">

                    <!-- 饼图占位 -->
                    <view class="pie-chart-placeholder">
                        <text>饼图占位</text>
                    </view>

                    <!-- 列表 -->
                    <view class="expense-list-vertical">
                        <view class="list-item" v-for="item in billDetail.expenseCategories" :key="item.id">
                            <view :class="['list-dot', item.dotClass]"></view>
                            <text class="item-name">{{ item.name }}</text>
                            <text class="item-value">¥{{ item.value }}</text>
                        </view>

                        <!-- 输入其他消费 -->
                        <view class="list-item input-item">
                            <view class="list-dot dot-gray"></view>
                            <text class="item-name">其他消费</text>
                            <view class="input-area">
                                <text class="input-prefix">¥</text>
                                <input class="input-box" type="digit" v-model="newExpense.value"
                                    :placeholder="newExpense.placeholder" @blur="handleNewExpenseSubmit" />
                            </view>
                        </view>

                        <view class="bill-total">
                            本月总支出
                            <!-- 计算属性显示格式化后的总金额 -->
                            <text class="total-value">{{ totalExpenseFormatted }}</text>
                        </view>
                    </view>

                </view>
            </view>


            <view class="safe-area-box"></view>
        </view>
    </view>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue';

// --- 状态变量 ---
const isLoading = ref(true);

// --- 核心数据结构：接收后端返回的账单详情数据 ---
const billDetail = ref({
    // 总支出 (后端计算好或前端计算，但用变量统一展示)
    totalExpense: 1248.00,
    // 饼图数据 (用于图表组件)
    chartData: {
        series: [
            { name: "主粮零食", data: 624, color: '#fdd835' },
            { name: "医疗保健", data: 400, color: '#42a5f5' },
            { name: "洗护美容", data: 224, color: '#ec407a' },
            // ... 后续分类
        ]
    },
    // 分类列表 (v-for 的数据源)
    expenseCategories: [
        { id: 1, name: '主粮零食', value: 624, dotClass: 'dot-yellow' },
        { id: 2, name: '医疗保健', value: 400, dotClass: 'dot-blue' },
        { id: 3, name: '洗护美容', value: 224, dotClass: 'dot-pink' },
    ]
});

// --- 新增支出输入 (用于“其他消费”或新增记录) ---
const newExpense = ref({
    value: '', // 存储用户输入的金额
    placeholder: '输入金额',
    category: '其他消费' // 默认类别
});

// --- 计算属性：格式化总支出 (方便视图展示) ---
const totalExpenseFormatted = computed(() => {
    // 简单的格式化，实际项目中可能需要更复杂的工具函数
    return `¥${billDetail.value.totalExpense.toFixed(2)}`;
});


// --- 核心函数：获取后端数据 ---
const fetchBillDetail = async () => {
    isLoading.value = true;
    try {
        // **这里是未来接入 uniCloud.callFunction 或 uni.request 的位置**
        // 示例：const res = await uniCloud.callFunction({ name: 'getMonthlyBillDetail', data: { month: new Date().getMonth() + 1 } });

        // 模拟数据加载延迟
        await new Promise(resolve => setTimeout(resolve, 800));

        // 模拟后端返回并更新响应式数据
        const mockData = {
            totalExpense: 1500.50, // 假设总金额发生变化
            expenseCategories: [
                { id: 1, name: '主粮零食', value: 700.00, dotClass: 'dot-yellow' },
                { id: 2, name: '医疗保健', value: 450.50, dotClass: 'dot-blue' },
                { id: 3, name: '洗护美容', value: 350.00, dotClass: 'dot-pink' },
            ]
        };

        billDetail.value.totalExpense = mockData.totalExpense;
        billDetail.value.expenseCategories = mockData.expenseCategories;
        // 饼图数据也需要相应更新...

    } catch (error) {
        console.error('获取账单详情失败:', error);
        uni.showToast({ title: '加载失败', icon: 'error' });
    } finally {
        isLoading.value = false;
    }
};

// --- 处理新支出的提交（用户输入完成后） ---
const handleNewExpenseSubmit = () => {
    const value = parseFloat(newExpense.value.value);

    if (isNaN(value) || value <= 0) {
        // uni.showToast({ title: '请输入有效金额', icon: 'none' });
        return;
    }

    // **这里是调用后端 API 提交新支出的位置**
    // 示例：uniCloud.callFunction({ name: 'addExpense', data: { category: newExpense.value.category, amount: value } });

    console.log(`提交新的支出：${newExpense.value.category}，金额 ¥${value}`);

    // 提交成功后，清空输入框，并重新拉取数据以更新图表和列表
    newExpense.value.value = '';
    fetchBillDetail(); // 重新拉取数据
};

// --- 跳转函数 (无需修改) ---
const goBack = () => {
    uni.navigateBack();
};

// --- 生命周期钩子：组件挂载后自动请求数据 ---
onMounted(() => {
    fetchBillDetail();
});
</script>

<style scoped>
.layout {
    position: relative;
    z-index: 1;
    /* min-height: 100vh; */
}

.bill-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx 0;
}

.back-icon,
.more-icon {
    font-size: 40rpx;
    color: #333;
}

.loading-text {
    font-size: 24rpx;
    color: #999;
    width: 40rpx;
    text-align: right;
}

.page-title {
    font-size: 36rpx;
    font-weight: bold;
}

.bill-total {
    text-align: center;
    font-size: 30rpx;
    color: #666;
    margin: 40rpx 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.total-value {
    display: block;
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
}

.card {
    background-color: #fff;
    border-radius: 20rpx;
    box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);
    padding: 40rpx 30rpx;
    box-sizing: border-box;
}

/* ---------------------------------------------------- */
/* 核心：垂直布局容器 - 确保与模板类名一致 */
/* ---------------------------------------------------- */
.bill-chart-card {
    width: 100%;
    /* 容器更窄 */
    padding: 60rpx 20rpx;
    /* 上下内边距增高 */
    margin: 0 auto;
    /* 居中 */
    border-radius: 25rpx;
    /* 圆角更圆润 */
    box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.08);
    /* 阴影效果 */
    background-color: #fff;
    /* 确保白底和阴影明显 */
    box-sizing: border-box;
}


/* 容器：垂直布局 */
.bill-pie-and-list-vertical {
    display: flex;
    flex-direction: column;
    /* 垂直排列 */
    align-items: center;
    /* 水平居中 */
    width: 100%;
}

/* 饼图占位样式 */
.pie-chart-placeholder {
    width: 400rpx;
    height: 400rpx;
    border-radius: 50%;
    background-color: #f5f5f5;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #999;
    font-size: 24rpx;
    margin-bottom: 60rpx;
    /* 底部间距 */
}

/* 列表容器 */
.expense-list-vertical {
    width: 100%;
}

/* 列表项 */
.list-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15rpx 0;
    border-bottom: 1rpx solid #f8f8f8;
}

/* 最后一项去掉底边框 */
.expense-list-vertical .list-item:last-child {
    border-bottom: none;
}

/* 圆点 */
.list-dot {
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
    margin-right: 15rpx;
}

.dot-yellow {
    background: #FDD100;
}

.dot-blue {
    background: #42a5f5;
}

.dot-pink {
    background: #ec407a;
}

.dot-gray {
    background: #ccc;
}

/* 名称和值 */
.item-name {
    flex-grow: 1;
    color: #666;
}

.item-value {
    font-weight: bold;
    color: #333;
}

/* 输入框区域 */
.input-area {
    display: flex;
    align-items: center;
}

.input-prefix {
    margin-right: 5rpx;
    font-size: 28rpx;
}

.input-box {
    text-align: right;
    font-size: 30rpx;
    height: 40rpx;
    line-height: 40rpx;
    width: 150rpx;
    padding: 0;
    margin: 0;
    border-bottom: 2rpx solid #ccc;
}


.safe-area-box {
    height: 60rpx;
}
</style>