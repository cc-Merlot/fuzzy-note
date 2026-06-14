<template>
	<view class="layout backgound">
		<view class="my">
			<status-bar />
			<common-title title="我的宠物"></common-title>
			<view class="content">
				<view class="container">
					<view class="baseInfo">
						<view class="avatar">
							<image v-if="petData.avatar" class="image" :src="petData.avatar" mode="aspectFill"></image>
							<image v-else class="image" :src="commonImage.animalDefPic" mode="aspectFill" />
						</view>
						<view class="info">
							<view class="item">
								姓名：<text>{{ petData.name }}</text>
							</view>
							<view class="item">
								性别：
								<text v-if="petData.gender === 0">{{ '男生' }}</text>
								<text v-else-if="petData.gender === 1">{{ '女生' }}</text>
								<text v-else>{{ '未知' }}</text>
							</view>
							<view class="item">
								生日：<text>{{ petData.birthday }}</text>
							</view>
							<view class="item">
								体重：<text>{{ petData.weight }}</text>
							</view>
						</view>
					</view>
					<view class="isCutBall">
						是否绝育：<text>{{ petData.isCutBall ? '已绝育' : '未绝育' }}</text>
					</view>
				</view>
			</view>

		</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue'
	import { commonImage } from '@/config'


	const petData = ref({
		"gender": 0,
		"create_date": 1764925458305,
		"update_date": 1764925458305,
		"avatar": "https://mp-8fe49052-c613-441c-b1cc-4e1d05f7ef05.cdn.bspapp.com/avatar/20251205/1764925428531.webp",
		"name": "测试3",
		"weight": 20,
		"breed": "11",
		"birthday": 1761987853000,
		"isCutBall": false,
		"user_id": "692ff3b7a09a9bbb8169a107"
	})
</script>

<style lang="scss" scoped>
	.my {
		.content {
			padding: 30rpx;

			.container {
				background-color: #fff;
				border: 3rpx solid #000;
				border-radius: 30rpx;
				padding: 30rpx;
				display: flex;
				flex-direction: column;
				width: 100%;

				.baseInfo {
					display: flex;

					.avatar {
						width: 200rpx;
						height: 200rpx;
						margin-right: 20rpx;

						.image {
							width: 100%;
							height: 100%;
							border: 3rpx solid #000;
							border-radius: 10rpx;

						}
					}

					.info {
						.item {
							margin-bottom: 10rpx;
						}
					}
				}

				.isCutBall {
					margin-top: 20rpx;
					width: 100%;
					border-bottom: 3rpx solid #000;
					height: 70rpx;
					line-height: 70rpx;
				}
			}
		}

	}
</style>