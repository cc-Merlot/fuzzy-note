<template>
	<view class="myPet">
		<view class="title">
			<text class="font">我的宠物</text>
		</view>

		<scroll-view v-if="!loading" class="scroll" scroll-y>
			<view v-if="petList.length > 0" class="petList">

				<view v-for="item in petList" :key="item._id" class="petItem" @click="onClickPet(item)">
					<view class="petAvatar">
						<image v-if="!item.avatar" class="image" :src="commonImage.animalDefPic"
							mode="aspectFill" />
						<image v-else class="image" :src="item.avatar" mode="aspectFill" />
					</view>
					<view class="info">
						<view class="name">
							<text class="nameTxt">{{ item.name }}</text>
							<text v-if="item.gender == 1" class="iconfont icon-nv"
								style="color:#ff80b4;font-size: 24rpx;"></text>
							<text v-else-if="item.gender == 0" class="iconfont icon-nan" style="color:#70c3f2"></text>
						</view>
						<view class="data">{{ item.birthday ? getAge(item.birthday) : '未知' }} | {{ item.weight ?
              item.weight +
              'kg' : '未知' }}</view>
					</view>

				</view>

			</view>
			<view v-else class="noData">还没有宠物哦~</view>

			<view class="addPet">
				<button @click="onClickAdd" class="addBtn">
					<text class="iconfont icon-tianjia1 txt" style="font-size: 38rpx;font-weight:600"></text>
					<text class="txt"> &nbsp;添加宠物</text>
				</button>
			</view>
		</scroll-view>

		<view v-else class="loading">
			<uni-load-more status="loading"></uni-load-more>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		watch
	} from 'vue'
	import { commonImage } from '@/config'
	import XEUtils from 'xe-utils'
	import dayjs from 'dayjs'
	import relativeTime from 'dayjs/plugin/relativeTime'
	import 'dayjs/locale/zh-cn' // 中文

	// 配置 dayjs
	dayjs.extend(relativeTime)
	dayjs.locale('zh-cn')

	const petCloudObj = uniCloud.importObject("client-pet", {
		customUI: true
	})
	//宠物列表
	const petList = ref([])
	//加载
	const loading = ref(true)

	// 接收父组件传递的刷新信号
	const props = defineProps({
		refreshSignal: {
			type: Boolean,
			default: false
		}
	})

	// 监听刷新信号变化
	watch(() => props.refreshSignal, (newVal) => {
		getPetList()
	})


	// 定义可触发的事件
	const emit = defineEmits(['close', 'clickPet'])

	function getAge(date) {
		return dayjs(date).fromNow(true).replace('年', '岁')
	}
	// 点击宠物
	const onClickPet = (item) => {
		emit('clickPet', item)
	}


	const onClickAdd = () => {
		emit('close', '点击添加宠物')
		uni.navigateTo({
			url: '/pagesPet/addPet/addPet'
		})
	}


	const getPetList = async () => {
		try {
			if (XEUtils.isEmpty(uni.getStorageSync('uni-id-pages-userInfo'))) return
			loading.value = true;
			const {
				errCode,
				data
			} = await petCloudObj.list()
			if (errCode !== 0) return uni.showToast({
				title: '获取数据失败',
				icon: 'none'
			})
			petList.value = data
		} catch (err) {
			console.log(err)
			uni.showToast({
				title: '获取数据失败',
				icon: 'none',
			})
		} finally {
			loading.value = false;
		}
	}
</script>

<style lang="scss" scoped>
	.myPet {
		background-color: #fff;
		border: 3rpx solid #000;
		border-radius: 30rpx;
		padding: 23rpx 26rpx;
		width: 670rpx;
		min-height: 300rpx;

		.title {
			font-size: 36rpx;
			font-weight: bold;
			position: relative;
			display: inline-block;
		}

		.title .font {
			position: relative;
			z-index: 2;

			&::after {
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

		.loading {
			display: flex;
			justify-content: center;
			align-items: center;
			height: 200rpx;
		}


		.scroll {
			max-height: 365rpx;

			.petList {
				margin-top: 30rpx;
				display: grid;
				grid-template-columns: 1fr 1fr;
				grid-gap: 24rpx;




				.petItem {
					border: 3rpx solid #000;
					border-radius: 20rpx;
					padding: 20rpx;
					height: 154rpx;
					display: flex;
					align-items: center;

					.petAvatar {
						width: 88rpx;
						height: 88rpx;
						margin-right: 20rpx;

						.image {
							width: 100%;
							height: 100%;
							border: 3rpx solid #000;
						}
					}

					.info {
						.name {
							display: flex;
							align-items: center;
							font-size: 24rpx;

							.nameTxt {
								overflow: hidden;
								white-space: nowrap;
								text-overflow: ellipsis;
								max-width: 110rpx;
								display: inline-block;
							}

						}

						.data {
							margin-top: 20rpx;
							font-size: 22rpx;
						}
					}

				}
			}

			.noData {
				text-align: center;
				height: 200rpx;
				line-height: 200rpx;
				font-size: 32rpx;
				font-weight: 600;
			}
		}

		.addPet {
			margin-top: 30rpx;

			.addBtn {
				height: 78rpx;
				background-color: #fff;
				border: 3rpx dashed #000;
				line-height: 78rpx;
				font-size: 26rpx;
				display: flex;
				justify-content: center;
				align-items: center;
			}
		}

	}
</style>