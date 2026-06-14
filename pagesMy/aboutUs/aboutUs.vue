<template>
	<view class="layout backgound">
		<view class="my">
			<status-bar />
			<common-title title="关于我们"></common-title>

			<view class="container">
				<view class="logo">
					<image class="image" :src="commonImage.logo" mode="aspectFill"></image>
				</view>
				<view class="appName">毛茸宠记本</view>
				<view class="version">版本 {{ APP_VERSION }}</view>

				<view class="cardList">
					<navigator class="item" url="/pagesMy/service/service" hover-class="navigator-hover">
						<view class="left">
							用户协议
						</view>
						<view class="right">
							<uni-icons type="right" size="20"></uni-icons>
						</view>
					</navigator>
					<navigator class="item" url="/pagesMy/privacy/privacy" hover-class="navigator-hover">
						<view class="left">
							隐私政策
						</view>
						<view class="right">
							<uni-icons type="right" size="20"></uni-icons>
						</view>
					</navigator>
				</view>


			</view>
			<view class="beian">备案号：粤ICP备2025509935号-1X</view>

			<view class="safe-area-box"></view>
		</view>
	</view>
</template>

<script setup>
	import {
		APP_VERSION
	} from '@/utils/version'
	import { commonImage } from '@/config'
</script>

<style lang="scss" scoped>
	.layout {

		height: 100vh;

		.my {
			display: flex;
			flex-direction: column;
			height: 100%;

			.container {
				flex: 1;
				padding: 0 30rpx;
				display: flex;
				flex-direction: column;
				align-items: center;

				.logo {
					margin-top: 50rpx;
					width: 250rpx;
					height: 250rpx;

					.image {
						width: 100%;
						height: 100%;
						border-radius: 20rpx;
					}

				}

				.appName {
					margin-top: 20rpx;
					font-size: 36rpx;
				}

				.version {
					margin-top: 20rpx;
					font-size: 26rpx;
					color: #333;
				}

				.cardList {
					margin-top: 50rpx;
					width: 100%;

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

			}

			.beian {
				padding-bottom: 40rpx;
				font-size: 24rpx;
				color: #888;
				display: flex;
				justify-content: center;
			}
		}


	}
</style>