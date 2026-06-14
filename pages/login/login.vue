<template>
	<view class="page-wrap backgound">

		<view class="page-content">
			<status-bar />
			<common-title title="登录"></common-title>

			<view class="container">
				<view class="logo">
					<image class="image" :src="commonImage.logo" mode="aspectFill"></image>
				</view>
				<view class="appName">欢迎来到毛茸宠记本</view>


				<view class="group">
					<view class="btn weixin" hover-class="btnHover" hover-start-time="50" hover-stay-time="50"
						@click.stop="wxLogin">
						<uni-icons type="weixin" size="30" color="#333"></uni-icons>
						<text>微信一键登录</text>
					</view>
					<view class="btn pwd" hover-class="btnHover" @click="gotoPwd">
						<uni-icons type="locked-filled" size="25" color="#333"></uni-icons>
						<text>账号密码登录</text>
					</view>
				</view>

				<view class="agreement">
					<uni-id-pages-agreements scope="login" ref="agreements"></uni-id-pages-agreements>
				</view>
			</view>

		</view>

	</view>
</template>

<script setup>
	import {
		ref
	} from "vue";
	import {
		onLoad
	} from "@dcloudio/uni-app";
	import { commonImage } from '@/config'
	import {
		mutations,
		store
	} from "@/uni_modules/uni-id-pages/common/store";

	const agreements = ref(null);
	const uniIdCo = uniCloud.importObject('uni-id-co', {
		customUI: true
	})

	let uniIdRedirectUrl = '';

	onLoad((e) => {
		uniIdRedirectUrl = e.uniIdRedirectUrl
	})

	// 微信一键登录
	const wxLogin = async () => {
		try {
			// 校验协议是否勾选
			if (!agreements.value.isAgree) return agreements.value.popup(wxLogin)
			uni.showLoading({
				title: '登录中...'
			});
			let {
				code
			} = await uni.login()
			let {
				errCode,
				...rest
			} = await uniIdCo.loginByWeixin({
				code
			})
			if (errCode !== 0) return uni.showToast({
				title: '登录失败请重试',
				icon: 'none'
			})
			mutations.loginSuccess({
				...rest,
				uniIdRedirectUrl: decodeURIComponent(uniIdRedirectUrl)
			})
		} catch (err) {
			console.log(err)
			uni.showToast({
				title: '登录失败请重试',
				icon: 'none'
			})
		} finally {
			uni.hideLoading()
		}
	}

	// 账号密码登录
	const gotoPwd = () => {
		uni.navigateTo({
			url: '/pages/login/login-withpwd?uniIdRedirectUrl=' + uniIdRedirectUrl
		})
	}
</script>

<style scoped lang="scss">
	.page-wrap {
		.page-content {
			min-height: 50vh;

			.container {
				display: flex;
				align-items: center;
				flex-direction: column;
				width: 100%;

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

				.group {
					padding: 140rpx 60rpx 40rpx;
					display: flex;
					flex-direction: column;
					gap: 40rpx;
					width: 100%;

					.btn {
						width: 100%;
						height: 96rpx;
						display: flex;
						justify-content: center;
						align-items: center;
						font-size: 38rpx;
						color: #333;
						background-color: #ffeb3b;
						border: 3rpx solid #000;
						border-radius: 48rpx;

						text {
							padding-left: 10rpx;
						}
					}

					.btnHover {
						transform: scale(0.98);
					}
				}

				.agreement {
					padding: 0 60rpx 0;
				}
			}


		}
	}
</style>