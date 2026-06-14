<template>
	<indexSkeleton v-if="pageLoading"></indexSkeleton>
	<view v-else class="layout backgound">
		<view class="index">
			<status-bar />
			<scroll-view class="scroll-view" scroll-y>
				<!-- 欢迎 -->
				<view class="wlecome">
					<view class="hi" v-if=true>Hi {{ userName }}</view>
					<view class="hi" v-else>欢迎来到毛茸茸日报</view>
					<view class="good">{{ greet }}</view>
				</view>

				<!-- 我的宠物 -->
				<view class="myPetcont card">
					<view class="nail"></view>
					<view @click="uni.navigateTo({ url: '/pagesPet/addPet/addPet' })" v-if="XEUtils.isEmpty(currentPet)"
						class="add">
						<text class="iconfont icon-tianjia1" style="font-size: 38rpx;font-weight:600"></text>
						&nbsp;添加我的宠物
					</view>
					<view v-else class="prtInfo">
						<view class="avatar">
							<image v-if="currentPet.avatar" class="image" :src="currentPet.avatar" mode="aspectFill" />
							<image v-else class="image" :src="commonImage.animalDefPic" mode="aspectFill" />
						</view>
						<view class="content">
							<view class="name">{{ currentPet.name }}
								<text v-if="currentPet.gender == 1" class="iconfont icon-nv"
									style="color:#ff80b4"></text>
								<text v-else-if="currentPet.gender == 0" class="iconfont icon-nan"
									style="color:#70c3f2"></text>
							</view>
							<view class="data">{{ currentPet.birthday ? getAge(currentPet.birthday) : '未知年龄' }} | {{ currentPet.weight
								?
								currentPet.weight +
								'kg' : '未知体重' }}</view>
							<text class="tags">
								{{ currentPet.personality ? currentPet.personality : '未知性格' }}
							</text>
						</view>
						<view class="menu">
							<!-- 修改宠物信息 -->
							<!-- <view class="edit button"><text class="iconfont icon-bianji" style="font-size: 38rpx;"></text></view> -->
							<!-- 切换宠物 -->
							<view @click="openPetPopup" class="transform button"><text
									class="iconfont icon-qiehuan"></text>
							</view>
						</view>

					</view>

				</view>

				<!-- 提示 -->
				<view class="tip">
					<view class="todo card">
						<view v-for="item in noticeList" :key="item._id" class="item">
							<text class="iconfont icon-diandian" style="font-size: 15rpx;"></text>{{ item.content }}
						</view>
						<view class="noTodo" v-if="noticeList.length == 0">暂无任务</view>
						<view class="cloud"><text class="iconfont2 iconx-a-xingzhuang6kaobei2"
								style="font-size: 80rpx;"></text>
						</view>
					</view>
					<view class="right">
						<navigator url="/pages/record/record?clickType=1" open-type="reLaunch" class="write card">
							<view class="left">
								<view class="title">记录</view>
								<view class="info">更好地照顾小宠</view>
							</view>
							<view class="icon">
								<text class="iconfont2 iconx-shouye_jishiben" style="font-size: 92rpx;"></text>
							</view>
						</navigator>
						<navigator url="/pages/record/record?clickType=0" open-type="reLaunch" class="notice card">
							<view class="left">
								<view class="title">清单</view>
								<view class="info">防止忘记</view>
							</view>
							<view class="icon">
								<text class="iconfont2 iconx-shouye_tishi" style="font-size: 92rpx;"></text>
							</view>
						</navigator>
					</view>
				</view>

				<!-- 今日科普 -->
				<navigator :url="`/pages/science/detail?id=${dailyData._id}`" class="science card">
					<view class="title">
						<view class="todayScience">
							<text class="font">今日科普</text>
						</view>
						<view v-if="dailyData.category == 1" class="todayTitle">【基础认知】</view>
						<view v-else-if="dailyData.category == 2" class="todayTitle">【科学养育】</view>
						<view v-else class="todayTitle">【健康医学】</view>
					</view>
					<view class="container">
						<view class="bigCat">
							<image class="image" :src="commonImage.officeCat" mode="aspectFill" />
						</view>

						<view class="content">{{ dailyData.title }}</view>
						<view class="getMore"><uni-icons type="right" size="16" color="#333"></uni-icons><uni-icons
								type="right" size="16" color="#333"></uni-icons>点击查看详情</view>
						<view class="icons">
							<view v-for="item in 3" :key="item" class="fish-icon">
								<text class="iconfont icon-Frame-2" style="font-size: 60rpx;"></text>
							</view>
						</view>
					</view>
				</navigator>

				<view style="height: 40rpx;"></view>

				<!-- 我的宠物弹出层 -->
				<uni-popup ref="myPetPopup" type="center">
					<myPet @clickPet="handelClickPet" :refresh-signal="refreshPetFlag" @close="handleClose"></myPet>
				</uni-popup>
			</scroll-view>

		</view>

	</view>
</template>

<script setup>
	import {
		ref,
		computed
	} from 'vue'
	import {
		onLoad,
		onShow
	} from '@dcloudio/uni-app'
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js'
	import { commonImage } from '@/config'
	import indexSkeleton from './components/indexSkeleton.vue'
	import XEUtils from 'xe-utils'
	import {
		usePetStore
	} from '@/store/pet'

	import dayjs from 'dayjs'
	import relativeTime from 'dayjs/plugin/relativeTime'
	import 'dayjs/locale/zh-cn' // 中文

	// 配置 dayjs
	dayjs.extend(relativeTime)
	dayjs.locale('zh-cn')


	const petStore = usePetStore()
	const newCloudObj = uniCloud.importObject("client-science", {
		customUI: true
	})
	const petCloudObj = uniCloud.importObject("client-pet", {
		customUI: true
	})
	const taskCloudObj = uniCloud.importObject("client-task", {
		customUI: true
	})
	const myPetPopup = ref(null)
	let isFirstLoad = true

	const dailyData = ref({
		title: '',
		category: 1,
	})
	const pageLoading = ref(true)
	// 当前宠物
	const currentPet = computed(() => {
		return petStore.indexCurrentPet
	})

	// 用户信息
	const userName = computed(() => {
		return store.userInfo.nickname || '游客'
	})
	const greet = ref('')

	// 刷新我的宠物信号
	const refreshPetFlag = ref(false)
	const noticeList = ref([])

	onLoad(async () => {
		pageLoading.value = true
		await Promise.all([
			getDaily(),
			getFirstPet(),
			getTaskList()
		])

		greet.value = getGreeting()
		pageLoading.value = false
		isFirstLoad = false
	})

	onShow(async () => {
		if (isFirstLoad) return
		uni.showLoading({
			title: '加载中...'
		})
		await Promise.all([
			getFirstPet(),
			getTaskList()
		])
		uni.hideLoading({})
	})

	//获取今日任务列表
	const getTaskList = async () => {
		try {
			//没有登录直接返回
			if (XEUtils.isEmpty(uni.getStorageSync('uni-id-pages-userInfo'))) return
			const {
				errCode,
				data
			} = await taskCloudObj.listToday()
			if (errCode !== 0) {
				return uni.showToast({
					title: '获取任务数据失败',
					icon: 'none'
				})
			}
			noticeList.value = data
		} catch (err) {
			console.log(err)
		}
	}

	function getAge(date) {
		return dayjs(date).fromNow(true).replace('年', '岁')
	}
	//获得第一个宠物数据
	const getFirstPet = async () => {
		try {
			// 有数据直接返回
			if (!XEUtils.isEmpty(petStore.indexCurrentPet)) return
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
			petStore.setIndexCurrentPet(data)
		} catch (err) {
			console.log(err)
			return uni.showToast({
				title: '获取宠物数据失败',
				icon: 'none'
			})
		}

	}
	//切换宠物
	const handelClickPet = (pet) => {
		petStore.setIndexCurrentPet(pet)
		myPetPopup.value.close()
	}

	const openPetPopup = () => {
		// 切换刷新信号，触发子组件重新加载
		refreshPetFlag.value = !refreshPetFlag.value
		myPetPopup.value.open()
	}

	const handleClose = () => {
		myPetPopup.value.close()
	}

	// 获取问候语
	const getGreeting = (date = new Date()) => {
		const hour = date.getHours();

		if (hour >= 5 && hour < 12) {
			return "Good morning!";
		} else if (hour >= 12 && hour < 18) {
			return "Good afternoon!";
		} else if (hour >= 18 && hour < 22) {
			return "Good evening!";
		} else {
			return "Good night!";
		}
	}



	const getDaily = async () => {
		try {
			const {
				errCode,
				data
			} = await newCloudObj.getDaily()
			if (errCode !== 0) return uni.showToast({
				title: '获取每日科普数据失败',
				icon: 'none',
			})
			dailyData.value = data
		} catch (err) {
			console.log(err)
			uni.showToast({
				title: '获取每日科普数据失败',
				icon: 'none',
			})
		}
	}
</script>

<style lang="scss" scoped>
	.layout {
		.index {
			padding-left: 40rpx;
			padding-right: 40rpx;
			display: flex;
			flex-direction: column;
			height: 100vh;

			.scroll-view {
				flex: 1;
				overflow-y: auto;

				.card {
					background-color: #fff;
					border: 3rpx solid #000;
					border-radius: 30rpx;
					padding: 23rpx;
				}

				.wlecome {
					padding-top: 20rpx;

					.hi {
						font-size: 36rpx;
						font-weight: 600;
					}

					.good {
						margin-top: 20rpx;
						font-size: 24rpx;
						font-weight: 400;
					}
				}

				.myPetcont {
					margin-top: 30rpx;
					width: 100%;
					height: 344rpx;
					position: relative;


					.nail {
						width: 128rpx;
						height: 20rpx;
						position: absolute;
						top: 20rpx;
						left: calc(50% - 64rpx);
						background-color: #ffeb3b;
						border-radius: 10rpx;
						border: 3rpx solid #000;

					}

					.add {
						display: flex;
						justify-content: center;
						align-items: center;
						font-size: 36rpx;
						font-weight: 500;
						height: 100%;
					}

					.prtInfo {
						display: flex;
						padding: 25rpx;

						.avatar {
							width: 230rpx;
							height: 230rpx;
							border-radius: 10rpx;
							border: 3rpx solid #000;
							margin-top: 30rpx;
							overflow: hidden;

							.image {
								width: 100%;
								height: 100%;

							}
						}

						.content {
							margin-left: 40rpx;
							margin-top: 40rpx;
							display: flex;
							flex-direction: column;
							justify-content: space-between;

							.name {
								font-size: 36rpx;
								font-weight: 600;
							}

							.data {
								font-size: 30rpx;
								font-weight: 500;
							}

							.tags {
								font-size: 28rpx;
								font-weight: 500;
								width: 300rpx;
								overflow: hidden;
								white-space: nowrap;
								text-overflow: ellipsis;
							}
						}

						.menu {
							position: absolute;
							top: 30rpx;
							right: 30rpx;

							.button {
								width: 80rpx;
								height: 50rpx;
								background-color: #252525;
								color: #fff;
								font-size: 22rpx;
								display: flex;
								justify-content: center;
								align-items: center;
								border-radius: 25rpx;
							}

							.transform {
								margin-top: 20rpx;
							}
						}
					}
				}

				.tip {
					display: flex;
					margin-top: 40rpx;
					justify-content: space-between;
					height: 380rpx;

					.todo {
						width: 322rpx;
						height: 100%;
						position: relative;

						.item {
							display: flex;
							align-items: center;
							font-size: 28rpx;
							margin-bottom: 13rpx;

							.iconfont {
								margin-right: 20rpx;
							}

							&:last-child {
								margin-bottom: 0;
							}

						}

						.cloud {
							position: absolute;
							bottom: -10rpx;
							right: -10rpx;
						}

						.noTodo {
							height: 100%;
							width: 100%;
							display: flex;
							align-items: center;
							justify-content: center;
						}
					}

					.right {
						display: flex;
						flex-direction: column;
						justify-content: space-between;
						width: 328rpx;

						.write,
						.notice {
							width: 100%;
							height: 176rpx;
							display: flex;
							align-items: center;
							justify-content: space-between;

							.left {
								.title {
									font-size: 30rpx;
									font-weight: 600;
								}

								.info {
									margin-top: 10rpx;
									font-size: 24rpx;
									font-weight: 400;
								}
							}
						}
					}
				}

				.science {
					margin-top: 40rpx;
					position: relative;
					min-height: 400rpx;
					display: flex;
					flex-direction: column;

					.title {
						display: flex;
						align-items: flex-end;
						/* 底部对齐 */

						.todayScience {
							font-size: 36rpx;
							font-weight: bold;
							position: relative;
							display: inline-block;
						}

						.todayScience .font {
							position: relative;
							z-index: 2;
						}

						.todayScience .font::after {
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



						.todayTitle {
							margin-left: 40rpx;
							font-size: 24rpx;
							font-weight: bold;
						}
					}

					.container {
						margin-top: 40rpx;
						display: flex;
						flex-direction: column;
						justify-content: space-between;
						flex: 1;

						.content {

							width: 380rpx;
						}

						.icons {
							margin-top: 20rpx;
							display: flex;

							.fish-icon {
								margin-right: 10rpx;
							}
						}

						.getMore {
							margin-top: 20rpx;
							font-size: 24rpx;
							color: #333;
							display: flex;
							align-items: center;
						}
					}



					.bigCat {
						width: 272rpx;
						height: 270rpx;
						position: absolute;
						right: 0;
						bottom: -10rpx;

						.image {
							width: 100%;
							height: 100%;
						}
					}
				}

				.myPetContainer {
					width: 670rpx;
					background: #ffffff;
					min-height: 800rpx;
				}
			}


		}
	}
</style>