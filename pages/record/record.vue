<template>
	<view class="layout backgound">
		<view class="record">
			<status-bar />
			<view class="title">毛茸宠记本</view>
			<scroll-view class="scroll-view" scroll-y>
				<view class="scrollContainer">
					<view class="menu">
						<view class="write button" :class="{ active: activeType == 1 }" @click="onChangeToRecord">记录
						</view>
						<view class="notice button" :class="{ active: activeType == 0 }" @click="onChangeToTask">清单
						</view>
					</view>
					<!-- 日历 -->
					<view class="calendar">
						<ren-calendar ref='ren' :open="false" :markDays='markDays' @onChangeMonth="onChangeMonth"
							@onDayClick='onDayClick'></ren-calendar>
					</view>

					<view v-if="activeType == 1" class="pet" @click="openPetPopup">
						当前宠物：
						<view class="name" v-if="!XEUtils.isEmpty(selectedPet)">{{ selectedPet.name }}</view>
						<view class="name" v-else>暂无</view>
						<view><uni-icons type="right" size="18"></uni-icons></view>
					</view>

					<!-- 记录列表 -->
					<view v-if="activeType == 1" class="recordList">
						<view v-if="isFuture" class="future">未来日期不可记录</view>
						<view v-else class="item" @click="onClickPopop(index)" v-for="(item, index) in menuList"
							:key="index">
							<view class="left">
								<text class="iconfont2" :class="item.iconClass" :style="{ fontSize: '50rpx' }"></text>
								&nbsp;{{ item.name }}
							</view>
							<view class="right">
								<view class="eatContainer" v-if="index == 0 && !XEUtils.isEmpty(recordStore.eatData)">
									<view style="margin-right: 10rpx;">{{ recordStore.eatData.food_name }}</view>
									<view v-if="recordStore.eatData.food_weight">{{ recordStore.eatData.food_weight }}g
									</view>
								</view>
								<view v-else-if="index == 1 && !XEUtils.isEmpty(recordStore.drinkData)">
									{{ recordStore.drinkData.volume }}ml
								</view>
								<view v-else-if="index == 2 && !XEUtils.isEmpty(recordStore.weightData)">
									{{ recordStore.weightData.weight }}kg
								</view>
								<view class="washIcon"
									v-else-if="index == 3 && !XEUtils.isEmpty(recordStore.washList) && !XEUtils.isEmpty(recordStore.washList.washList)">
									<view class="icon" v-for="(item, index) in recordStore.washList.washList"
										:key="index">
										<text class="iconfont" :class="washIcon[item - 1].icon"></text>
									</view>
								</view>
								<view class="healthIcon"
									v-else-if="index == 4 && !XEUtils.isEmpty(recordStore.healthData)">
									<text v-if="recordStore.healthData.shitStatus" class="iconfont icon-bianbian"
										:style="{ color: shitList[recordStore.healthData.shitStatus - 1].color, fontSize: '44rpx' }"></text>
									<text v-if="recordStore.healthData.peeStatus" class="iconfont icon-liuhan"
										:style="{ color: peeList[recordStore.healthData.peeStatus - 1].color }"></text>
								</view>
								<view v-else-if="index == 5 && !XEUtils.isEmpty(recordStore.writeData)">
									<uni-icons type="camera-filled" size="26" color="#ffeb3b"></uni-icons>
								</view>
								<view v-else-if="index == 6 && !XEUtils.isEmpty(recordStore.sportsData)">
									{{ recordStore.sportsData.sport_time }}min
								</view>
								<uni-icons v-else :type="item.iconType" size="26"></uni-icons>
							</view>
						</view>
					</view>
					<!-- 提醒列表 -->
					<view v-else class="noticeList">
						<!-- 提醒类型 -->
						<view class="noticeType">
							<view v-for="(item, index) in noticeTypeList" :key="index" class="noticeItem">
								<view class="colour" :style="{ backgroundColor: item.color }"></view>
								<text class="noticeName">{{ item.name }}</text>
							</view>
						</view>

						<!-- 提醒列表 -->
						<view class="list" v-if="noticeList.length > 0">
							<view class="item" @click="onClickTask(item._id)" v-for="(item, index) in noticeList"
								:key="index">
								<view class="bar" :style="{ backgroundColor: noticeTypeList[item.type - 1].color }">
								</view>
								<view class="content">
									<view class="left">
										<view @click.stop="onChangeTaskStatus(item)" class="finishBtn">
											<uni-icons v-if="!item.isFinished" type="circle" size="24"></uni-icons>
											<uni-icons v-else type="checkbox-filled" size="24"></uni-icons>
										</view>
										<view class="renwu">
											<view class="noticeCotent" :class="{ delete: item.isFinished }">
												{{ item.content }}</view>
											<view class="time" :class="{ delete: item.isFinished }">
												{{ dayjs(item.time).format('HH:mm') }}
											</view>
										</view>
									</view>
									<view @click.stop="removeTask(item._id)" class="right">
										<uni-icons type="trash-filled" size="30" color="#dd524d"></uni-icons>
									</view>
								</view>
							</view>

						</view>

						<view v-else class="noNotice">
							<view class="noNoticeText">还没有提醒哦~</view>
						</view>


					</view>

					<!-- 弹出层 -->
					<uni-popup ref="popup" type="bottom" border-radius="30rpx 30rpx 0 0">
						<recordPopup @close="handleClose" :recordType="popupType"></recordPopup>
					</uni-popup>
				</view>

			</scroll-view>

			<!-- 添加提醒 -->
			<view @click="uni.navigateTo({ url: './addNotice' })" class="addNotice" v-if="activeType == 0">
				<view class="icon">
					<image class="image" :src="commonImage.addCat" mode="aspectFill" />
				</view>
			</view>

			<!-- 我的宠物弹出层 -->
			<uni-popup ref="myPetPopup" type="center">
				<myPet :refresh-signal="refreshPetFlag" @close="handleCloseMyPetPopup" @clickPet="handelClickPet">
				</myPet>
			</uni-popup>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed
	} from 'vue'
	import {
		recordPopup
	} from './components/recordPopup.vue'
	import {
		onLoad,
		onShow
	} from '@dcloudio/uni-app'
	import XEUtils from 'xe-utils'
	import {
		usePetStore
	} from '@/store/pet'
	import {
		useCalendarStore
	} from '@/store/calendar'
	import {
		useRecordStore
	} from '@/store/record'
	import dayjs from "dayjs";
	import {
		showModal
	} from '/utils/common'
	import { commonImage } from '@/config'

	const petStore = usePetStore()
	const calendarStore = useCalendarStore()
	const recordStore = useRecordStore()

	const petCloudObj = uniCloud.importObject("client-pet", {
		customUI: true
	})
	const drinkCloudObj = uniCloud.importObject("client-record-drink", {
		customUI: true
	})
	const weightCloudObj = uniCloud.importObject("client-record-weight", {
		customUI: true
	})
	const washCloudObj = uniCloud.importObject("client-record-wash", {
		customUI: true
	})
	const writeCloudObj = uniCloud.importObject("client-record-write", {
		customUI: true
	})
	const sportsCloudObj = uniCloud.importObject("client-record-sports", {
		customUI: true
	})
	const healthCloudObj = uniCloud.importObject("client-record-health", {
		customUI: true
	})
	const eatCloudObj = uniCloud.importObject("client-record-eat", {
		customUI: true
	})
	const taskCloudObj = uniCloud.importObject("client-task", {
		customUI: true
	})
	// 菜单类型 0:提醒 1:记录
	const activeType = ref(1)
	const popupType = ref(0)
	// 我的宠物弹出层
	const myPetPopup = ref(null)
	//记录弹出层
	const popup = ref(null)
	//是否为未来日期
	const isFuture = ref(false)
	const currentYear = ref(dayjs().year())
	const currentMonth = ref(dayjs().month() + 1)

	// 选中的宠物
	const selectedPet = computed(() => {
		return petStore.recordCurrentPet
	})

	// 刷新我的宠物信号
	const refreshPetFlag = ref(false)

	const info = ref({
		lunar: true,
		range: true,
		insert: false,
		selected: []
	})

	const noticeTypeList = [{
			name: '日常任务',
			color: '#ffeb3b'
		},
		{
			name: '洗护任务',
			color: '#b0f8ff'
		},
		{
			name: '清洁任务',
			color: '#ffc2b0'
		},
		{
			name: '用药任务',
			color: '#d2b0ff'
		}
	]
	const washIcon = ref([{
			name: '梳毛',
			icon: 'icon-shuzi'
		},
		{
			name: '洗澡',
			icon: 'icon-xizao'
		},
		{
			name: '驱虫',
			icon: 'icon-yaopian'
		},
		{
			name: '剪指甲',
			icon: 'icon-jianzhijia'
		},
		{
			name: '清耳',
			icon: 'icon-erduo'
		},
		{
			name: '刷牙',
			icon: 'icon-yachi'
		}
	])

	//便便列表
	const shitList = ref([{
			name: '干硬',
			color: '#3e2723'
		},
		{
			name: '完美',
			color: '#8b4513'
		},
		{
			name: '软便',
			color: '#c7a130'
		},
		{
			name: '拉稀',
			color: '#ffca28'
		}
	])
	//尿尿列表
	const peeList = ref([{
			name: '健康',
			color: '#fce863'
		},
		{
			name: '缺水',
			color: '#ff9800'
		},
		{
			name: '血尿',
			color: '#ff5252'
		},
		{
			name: '透明',
			color: '#e1f5fe'
		}
	])

	// 提醒完成
	const finished = ref(true)

	// 提醒列表
	const noticeList = ref([])

	// 标记的日期
	const markDays = ref([])
	// 菜单
	const menuList = [{
			iconClass: 'icon-yinshi',
			name: '饮食',
			iconType: 'plus-filled'
		},
		{
			iconClass: 'iconx-heshui',
			name: '喝水',
			iconType: 'plus-filled'
		},
		{
			iconClass: 'iconx-tizhong',
			name: '体重',
			iconType: 'plus-filled'
		},
		{
			iconClass: 'iconx-xihu',
			name: '洗护',
			iconType: 'plus-filled'
		},
		{
			iconClass: 'iconx-weishengqingkuang',
			name: '卫生情况',
			iconType: 'plus-filled'
		},
		{
			iconClass: 'iconx-jishi',
			name: '记事',
			iconType: 'camera-filled'
		},
		{
			iconClass: 'iconx-iconzhengli-',
			name: '运动',
			iconType: 'plus-filled'
		}
	]
	//当前日期
	const currentDate = ref(XEUtils.toDateString(new Date(), 'yyyy-MM-dd'))



	onLoad((e) => {
		let {
			clickType
		} = e
		if (clickType != null) activeType.value = Number(clickType)
		if (activeType.value == 0) {
			getTaskList()
			getTaskDate()
		}
		calendarStore.setCurrentDate(currentDate.value)
	})

	onShow(async () => {
		if (activeType.value == 1) {
			//记录
			if (XEUtils.isEmpty(petStore.recordCurrentPet)) {
				await getFirstPet()
			}
			await getRecordData()
		}
	})

	//获取标记日期
	const getTaskDate = async () => {
		if (activeType.value == 1) return
		//没有登录直接返回
		if (XEUtils.isEmpty(uni.getStorageSync('uni-id-pages-userInfo'))) return
		const {
			errCode,
			data
		} = await taskCloudObj.getTaskDatesByMonth(currentYear.value, currentMonth.value)
		if (errCode !== 0) return uni.showToast({
			title: '获取数据失败',
			icon: 'none'
		})
		markDays.value = data.map(day => {
			const dayStr = day.toString().padStart(2, '0');
			const monthStr = currentMonth.value.toString().padStart(2, '0');
			return `${currentYear.value}-${monthStr}-${dayStr}`;
		});
		console.log(markDays.value)
	}

	const onChangeMonth = (e) => {
		let {
			year,
			month
		} = e
		currentYear.value = year
		currentMonth.value = month
		getTaskDate()
	}


	//点击清单
	const onChangeToTask = () => {
		activeType.value = 0
		getTaskList()
		getTaskDate()
	}

	//点击记录
	const onChangeToRecord = async () => {
		markDays.value = []
		activeType.value = 1
		if (XEUtils.isEmpty(petStore.recordCurrentPet)) {
			await getFirstPet()
		}
		await getRecordData()
	}

	//修改任务
	const onClickTask = (_id) => {
		uni.navigateTo({
			url: `./addNotice?_id=${_id}`
		})
	}

	//删除任务
	const removeTask = async (_id) => {
		try {
			const confirmed = await showModal('确认删除吗？');
			if (confirmed) {
				// 执行删除操作
				uni.showLoading({
					title: '加载中'
				})
				const {
					errCode
				} = await taskCloudObj.remove(_id)
				if (errCode !== 0) return uni.showToast({
					title: '删除失败',
					icon: 'none'
				})
				uni.showToast({
					title: '删除成功',
					icon: 'none'
				})
				noticeList.value = noticeList.value.filter(item => item._id !== _id);
			}
		} catch (err) {
			console.log(err)
		} finally {
			uni.hideLoading()
		}
	}

	//修改任务完成状态
	const onChangeTaskStatus = async (item) => {
		try {
			uni.showLoading({
				title: '加载中'
			})
			item.isFinished = !item.isFinished
			const {
				errCode
			} = await taskCloudObj.update({
				_id: item._id,
				isFinished: item.isFinished
			})
			if (errCode !== 0) return uni.showToast({
				title: '修改失败',
				icon: 'none'
			})
		} catch (err) {
			console.log(err)
			return uni.showToast({
				title: '修改失败',
				icon: 'none'
			})
		} finally {
			uni.hideLoading()
		}

	}

	//获取任务列表
	const getTaskList = async () => {
		try {
			//没有登录直接返回
			if (XEUtils.isEmpty(uni.getStorageSync('uni-id-pages-userInfo'))) return
			uni.showLoading({
				title: '加载中'
			})
			const {
				errCode,
				data
			} = await taskCloudObj.list(currentDate.value)
			if (errCode !== 0) {
				return uni.showToast({
					title: '获取任务数据失败',
					icon: 'none'
				})
			}
			noticeList.value = data
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
		const {
			errCode,
			data
		} = await petCloudObj.getFirstPet()
		if (errCode !== 0) {
			return uni.showToast({
				title: '获取宠物数据失败',
				icon: 'none'
			})
		}
		petStore.setCurrentPet(data)
	}
	//获取记录数据
	const getRecordData = async () => {
		console.log('获取记录数据')
		//没有宠物数据
		if (XEUtils.isEmpty(petStore.recordCurrentPet)) {
			return
		}
		uni.showLoading({
			title: '加载中'
		})
		//重新获取宠物数据
		await Promise.all([
			getDrink(),
			getweight(),
			getWash(),
			getWrite(),
			getSports(),
			getHealth(),
			getEat()
		])
		uni.hideLoading()
	}

	//获取宠物的喝水数据
	const getDrink = async () => {
		const {
			errCode,
			data
		} = await drinkCloudObj.detail({
			pet_id: petStore.recordCurrentPet._id,
			drink_date: currentDate.value
		})
		if (errCode !== 0) {
			return uni.showToast({
				title: '获取喝水数据失败',
				icon: 'none'
			})
		}
		recordStore.setDrinkVolum(data)
	}
	//获取宠物的体重数据
	const getweight = async () => {
		const {
			errCode,
			data
		} = await weightCloudObj.detail({
			pet_id: petStore.recordCurrentPet._id,
			weight_date: currentDate.value
		})
		if (errCode !== 0) {
			return uni.showToast({
				title: '获取体重数据失败',
				icon: 'none'
			})
		}
		recordStore.setWeightData(data)
	}
	//获取宠物的洗护数据
	const getWash = async () => {
		const {
			errCode,
			data
		} = await washCloudObj.detail({
			pet_id: petStore.recordCurrentPet._id,
			wash_date: currentDate.value
		})
		if (errCode !== 0) {
			return uni.showToast({
				title: '获取洗护数据失败',
				icon: 'none'
			})
		}
		recordStore.setWashList(data)
	}

	//获取宠物的卫生数据
	const getHealth = async () => {
		const {
			errCode,
			data
		} = await healthCloudObj.detail({
			pet_id: petStore.recordCurrentPet._id,
			health_date: currentDate.value
		})
		if (errCode !== 0) {
			return uni.showToast({
				title: '获取卫生数据失败',
				icon: 'none'
			})
		}
		recordStore.setHealthData(data)
	}
	//获取宠物的记事数据
	const getWrite = async () => {
		const {
			errCode,
			data
		} = await writeCloudObj.detail({
			pet_id: petStore.recordCurrentPet._id,
			write_date: currentDate.value
		})
		if (errCode !== 0) {
			return uni.showToast({
				title: '获取记事数据失败',
				icon: 'none'
			})
		}
		recordStore.setWriteData(data)
	}

	//获取宠物的运动数据
	const getSports = async () => {
		const {
			errCode,
			data
		} = await sportsCloudObj.detail({
			pet_id: petStore.recordCurrentPet._id,
			sport_date: currentDate.value
		})
		if (errCode !== 0) {
			return uni.showToast({
				title: '获取运动数据失败',
				icon: 'none'
			})
		}
		recordStore.setSportsData(data)
	}

	//获取宠物的饮食数据
	const getEat = async () => {
		const {
			errCode,
			data
		} = await eatCloudObj.detail({
			pet_id: petStore.recordCurrentPet._id,
			eat_date: currentDate.value
		})
		if (errCode !== 0) {
			return uni.showToast({
				title: '获取饮食数据失败',
				icon: 'none'
			})
		}
		recordStore.setEatData(data)
	}


	const openPetPopup = () => {
		// 切换刷新信号，触发子组件重新加载
		refreshPetFlag.value = !refreshPetFlag.value
		myPetPopup.value.open()
	}

	const handleCloseMyPetPopup = () => {
		myPetPopup.value.close()
	}


	// 点击切换宠物
	const handelClickPet = async (e) => {
		petStore.setCurrentPet(e)
		getRecordData()
		myPetPopup.value.close()
	}

	//打开记录弹出层
	const onClickPopop = (index) => {
		if (XEUtils.isEmpty(selectedPet.value)) {
			return uni.showToast({
				title: '请先选择宠物',
				icon: 'none'
			})
		}
		popupType.value = index
		calendarStore.setCurrentDate(currentDate.value)
		popup.value.open()
	}

	// 点击日历
	const onDayClick = async (e) => {
		currentDate.value = e.date
		calendarStore.setCurrentDate(currentDate.value)
		//转换为Date对象比较
		const targetDate = new Date(currentDate.value);
		const todayDate = new Date();

		// 比较年月日（忽略时间）
		targetDate.setHours(0, 0, 0, 0);
		todayDate.setHours(0, 0, 0, 0);
		// 结果比较
		isFuture.value = targetDate > todayDate ? true : false
		if (activeType.value === 0) {
			//任务
			getTaskList()
		} else {
			//记录  
			if (isFuture.value) return
			getRecordData()
		}
	}

	//关闭记录弹出层
	const handleClose = () => {
		popup.value.close()
	}
</script>

<style lang="scss" scoped>
	.record {
		display: flex;
		flex-direction: column;
		height: 100vh;

		.title {
			font-size: 36rpx;
			font-weight: 600;
			text-align: center;
			padding: 20rpx 40rpx 40rpx;
		}

		.scroll-view {
			flex: 1;
			overflow-y: auto;

			.scrollContainer {
				padding: 0 40rpx 130rpx;

				.menu {
					display: flex;
					justify-content: space-between;


					.button {
						width: 308rpx;
						height: 88rpx;
						border: 3rpx solid #000;
						border-radius: 44rpx;
						display: flex;
						justify-content: center;
						align-items: center;
						background-color: #fff;
					}

					.button.active {
						background-color: #ffeb3b;
					}
				}

				.calendar {
					width: 100%;
					margin-top: 30rpx;
				}

				.pet {
					margin-top: 30rpx;
					display: flex;
					justify-content: flex-end;
					align-items: center;

					.name {
						margin-right: 20rpx;
					}
				}

				.recordList {
					margin-top: 30rpx;

					.item {
						background-color: #fff;
						border: 3rpx solid #000;
						border-radius: 30rpx;
						padding: 0 20rpx;
						display: flex;
						justify-content: space-between;
						align-items: center;
						width: 100%;
						height: 100rpx;
						margin-bottom: 30rpx;

						.left {
							display: flex;
							align-items: center;
						}

						.right {


							.eatContainer {
								display: flex;
							}

							.washIcon {
								display: flex;

								.icon {
									margin-left: 10rpx;

									.iconfont {
										font-size: 40rpx;
										color: #2f88ff;
									}
								}
							}

							.healthIcon {
								display: flex;

								.iconfont {
									margin-left: 10rpx;
									font-size: 40rpx;
								}
							}
						}
					}

					.future {
						text-align: center;
						width: 100%;
						padding: 100rpx 0;
					}
				}

				.noticeList {
					.noticeType {
						display: flex;
						justify-content: space-between;
						padding: 30rpx 10rpx;

						.noticeItem {
							display: flex;
							align-items: center;
							font-size: 25rpx;

							.colour {
								width: 20rpx;
								height: 30rpx;
								border: 3rpx solid #000;
								border-radius: 10rpx;
								margin-right: 10rpx;
							}
						}
					}

					.list {
						.item {
							height: 140rpx;
							background-color: #fff;
							width: 100%;
							display: flex;
							border: 3rpx solid #000;
							border-radius: 13rpx 30rpx 30rpx 13rpx;
							border-left: 0;
							margin-bottom: 30rpx;

							.bar {
								width: 26rpx;
								height: 100%;
								// background-color: #ffeb3b;
								border-radius: 13rpx;
								border: 3rpx solid #000;
							}

							.content {
								flex: 1;
								padding: 20rpx 30rpx;
								display: flex;
								justify-content: space-between;
								align-items: center;


								.left {
									display: flex;
									align-items: center;
									height: 100%;

									.renwu {
										display: flex;
										flex-direction: column;
										justify-content: space-between;
										height: 100%;
									}

									.finishBtn {
										padding-right: 20rpx;
										height: 100%;
										display: flex;
										align-items: center;
									}
								}

								.right {
									height: 100%;
									padding: 0 10rpx;
									display: flex;
									align-items: center;
								}

								.noticeCotent {
									font-size: 32rpx;

								}

								.delete {
									text-decoration: line-through;
									color: #999;
								}

								.time {
									font-size: 26rpx;
								}
							}
						}

					}

					.noNotice {
						display: flex;
						flex-direction: column;
						align-items: center;
						justify-content: center;
						height: 100%;
						padding: 100rpx 0;

						.icon {
							width: 94rpx;
							height: 106rpx;

							.image {
								width: 100%;
								height: 100%;
							}
						}

						.noNoticeText {
							font-size: 32rpx;
							margin-top: 20rpx;
							color: #666;
						}
					}
				}
			}


		}

		.addNotice {
			position: fixed;
			right: 40rpx;
			/* 调整 bottom 值控制按钮距底部的距离 */
			bottom: 40rpx;
			z-index: 1000;

			.icon {
				width: 94rpx;
				height: 106rpx;

				.image {
					width: 100%;
					height: 100%;
				}
			}
		}


	}
</style>