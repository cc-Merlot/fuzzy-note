<template>
	<view class="layout backgound">
		<view class="my">
			<status-bar />
			<!-- 个人信息 -->
			<view class="userInfo card" @click="onClickInfo">
				<view class="avatar">
					<image v-if="userInfo.avatar" class="image" :src="userInfo.avatar" mode="aspectFill"></image>
					<image v-else class="image" :src="commonImage.defAvatar" mode="aspectFill" />
				</view>
				<view class="info">
					<view v-if="isLogin" class="name">
						{{ userInfo.nickname }}
					</view>
					<view v-else class="name">请先登录~</view>
					<text selectable v-if="isLogin" class="ID">ID: {{ userInfo._id }}</text>

				</view>

				<view class="pet">
					<image class="image" :src="commonImage.corgi" mode="aspectFill" />

				</view>
			</view>

			<!-- 我的宠物 -->
			<view class="myPetCont">
				<myPet :refresh-signal="refreshPetFlag" @clickPet="onClickPet"></myPet>
			</view>
			<!-- 菜单 列表 -->
			<view class="menuList">

				<navigator class="item" url="/pages/science/science" open-type="navigate" hover-class="navigator-hover">
					<view class="left">
						<text class="iconfont2 iconx-kepu" :style="{ fontSize: '46rpx' }"></text>
						&nbsp; &nbsp;科普
					</view>
					<view class="right">
						<uni-icons type="right" size="20"></uni-icons>
					</view>
				</navigator>
				<!-- <view class="item">
          <view class="left">
            <text class="iconfont2 iconx-shezhi" :style="{ fontSize: '50rpx' }"></text>
            &nbsp; &nbsp;设置
          </view>
          <view class="right">
            <uni-icons type="right" size="20"></uni-icons>
          </view>
        </view> -->
				<view class="item" @click="questionPopup.open()">
					<view class="left">
						<text class="iconfont2 iconx-wentifankui" :style="{ fontSize: '46rpx' }"></text>
						&nbsp; &nbsp;问题反馈
					</view>
					<view class="right">
						<uni-icons type="right" size="20"></uni-icons>
					</view>
				</view>
				<navigator class="item" url="/pagesMy/aboutUs/aboutUs" hover-class="navigator-hover">
					<view class="left">
						<text class="iconfont2 iconx-guanyuwomen" :style="{ fontSize: '46rpx' }"></text>
						&nbsp; &nbsp;关于我们
					</view>
					<view class="right">
						<uni-icons type="right" size="20"></uni-icons>
					</view>
				</navigator>
			</view>


			<!-- 问题反馈弹出层 -->
			<uni-popup class="questionPopup" ref="questionPopup" type="center" @change="change">
				<view class="content">
					<text class="title">问题反馈</text>
					<text class="txt">有任何问题，请反馈邮箱:</text>
					<text class="txt" selectable>merlot_23@outlook.com</text>
					<view @click="questionPopup.close()" class="cancel"><uni-icons type="closeempty" size="18"
							color="#333"></uni-icons></view>
				</view>
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
		onShow
	} from '@dcloudio/uni-app'
	import { commonImage } from '@/config'
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js'
	import {
		getPageAndParams
	} from '@/utils/common'
	import {
		isEmpty
	} from 'xe-utils'

	// 用户信息
	const userInfo = computed(() => {
		return store.userInfo
	})
	// 是否登录
	const isLogin = computed(() => {
		return store.hasLogin
	})

	const questionPopup = ref(null)

	// 刷新信号
	const refreshPetFlag = ref(false)


	onShow(() => {
		console.log('页面显示，触发宠物数据刷新')

		// 切换刷新信号，触发子组件重新加载
		refreshPetFlag.value = !refreshPetFlag.value

	})

	const onClickPet = (item) => {
		uni.navigateTo({
			url: `/pagesPet/addPet/addPet?id=${item._id}`
		})
	}

	const onClickInfo = () => {
		if (isLogin.value) uni.navigateTo({
			url: '/pages/userinfo/userinfo'
		})
		else uni.navigateTo({
			url: '/pages/login/login' + '?uniIdRedirectUrl=' + getPageAndParams()
		})
		// else uni.navigateTo({ url: '/uni_modules/uni-id-pages/pages/login/login-withoutpwd' })
	}
</script>

<style lang="scss" scoped>
	.my {
		padding: 40rpx;

		.card {
			background-color: #fff;
			border: 3rpx solid #000;
			border-radius: 30rpx;
			padding: 23rpx;
		}

		.userInfo {
			margin-top: 100rpx;
			display: flex;
			height: 252rpx;
			align-items: center;
			position: relative;

			.avatar {
				width: 155rpx;
				height: 155rpx;
				margin-right: 20rpx;

				.image {
					width: 100%;
					height: 100%;
					border: 3rpx solid #000;
					border-radius: 50%;
				}
			}

			.info {
				.name {
					font-size: 36rpx;
					font-weight: 600;
				}

				.ID {
					margin-top: 20rpx;
					font-size: 20rpx;
					font-weight: 500;
				}
			}

			.pet {
				position: absolute;
				bottom: 0;
				right: 20rpx;
				width: 140rpx;
				height: 140rpx;

				.image {
					width: 100%;
					height: 100%;
				}
			}
		}

		.myPetCont {
			margin-top: 40rpx;
		}

		.menuList {
			margin-top: 30rpx;

			.item {
				background-color: #fff;
				border: 3rpx solid #000;
				border-radius: 30rpx;
				padding: 0 30rpx;
				display: flex;
				justify-content: space-between;
				align-items: center;
				width: 100%;
				height: 100rpx;
				margin-bottom: 20rpx;

				.left {
					display: flex;
					align-items: center;
				}
			}
		}

		.questionPopup {

			.content {
				background-color: #fff;
				border: 3rpx solid #000;
				border-radius: 30rpx;
				padding: 30rpx 30rpx 50rpx;
				text-align: center;
				font-size: 30rpx;
				overflow: hidden;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				position: relative;

				.txt {
					margin-top: 10rpx;
				}

				.title {
					font-size: 36rpx;
					font-weight: 600;
					margin-bottom: 20rpx;
				}

				.cancel {
					position: absolute;
					top: 30rpx;
					right: 30rpx;
				}
			}
		}
	}
</style>