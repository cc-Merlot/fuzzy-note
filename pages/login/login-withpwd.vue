<template>

	<view class="container backgound">
		<status-bar />
		<view class="top">
			<view @click="uni.navigateBack()" class="back"><uni-icons type="left" size="24"></uni-icons></view>
			<view class="title">账号密码登录</view>
		</view>
		<!-- 顶部图 -->
		<view class="logo-box">
			<image class="logo" :src="commonImage.logo" mode="widthFix"></image>
		</view>

		<!-- 欢迎文字 -->
		<view class="welcome-text">欢迎来到毛茸宠记本</view>

		<!-- 登录表单（整体下移） -->
		<view class="form-box ">
			<view class="form-title">账号密码登录</view>
			<view class="code-row">
				<uni-easyinput :focus="focusUsername" @blur="focusUsername = false" class="input-box"
					:inputBorder="false" v-model="username" placeholder="请输入账号" trim="all" />
			</view>

			<view class="code-row">
				<uni-easyinput :focus="focusPassword" @blur="focusPassword = false" class="input-box" clearable
					type="password" :inputBorder="false" v-model="password" placeholder="请输入密码" trim="all" />
				<!-- <input class="input code-input" type="number" placeholder="请输入密码" v-model="password" /> -->
			</view>
			<!-- 带选择框的隐私政策协议组件 -->
			<uni-id-pages-agreements scope="login" ref="agreements"></uni-id-pages-agreements>

			<button class="login-btn" @click="pwdLogin">登录</button>

		</view>
		<!-- 忘记密码 -->
		<view class="link-box">
			<text class="link" @click="toRegister">{{ config.isAdmin ? '注册管理员账号' : '注册账号' }}</text>
			<!-- <text class="link" @click="toRegister" v-if="!config.isAdmin">注册账号</text> -->
		</view>

		<!-- 其他登录方式 -->
		<view class="other-login">
			<view class="other-text">其他登录方式</view>
			<text @click="uni.navigateTo({ url: '/pages/login/login?uniIdRedirectUrl=' + uniIdRedirectUrl })"
				class="iconfont2 iconx-denglu-weixindenglu" style="font-size: 60rpx;"></text>
			<!-- <image class="wechat" src="../../static/wechat.png"></image> -->
		</view>
	</view>
</template>

<script>
	import { commonImage } from '@/config'
	import mixin from '@/uni_modules/uni-id-pages/common/login-page.mixin.js';
	const uniIdCo = uniCloud.importObject("uni-id-co", {
		errorOptions: {
			type: 'toast'
		}
	})
	export default {
		mixins: [mixin],
		data() {
			return {
				"password": "",
				"username": "",
				"captcha": "",
				"needCaptcha": false,
				"focusUsername": false,
				"focusPassword": false
			}
		},
		onShow() {
			// #ifdef H5
			document.onkeydown = event => {
				var e = event || window.event;
				if (e && e.keyCode == 13) { //回车键的键值为13
					this.pwdLogin()
				}
			};
			// #endif
		},
		methods: {
			// 页面跳转，找回密码
			toRetrievePwd() {
				let url = '/uni_modules/uni-id-pages/pages/retrieve/retrieve'
				//如果刚好用户名输入框的值为手机号码，就把它传到retrieve页面，根据该手机号找回密码
				if (/^1\d{10}$/.test(this.username)) {
					url += `?phoneNumber=${this.username}`
				}
				uni.navigateTo({
					url
				})
			},
			/**
			 * 密码登录
			 */
			pwdLogin() {
				if (!this.password.length) {
					this.focusPassword = true
					return uni.showToast({
						title: '请输入密码',
						icon: 'none',
						duration: 3000
					});
				}
				if (!this.username.length) {
					this.focusUsername = true
					return uni.showToast({
						title: '请输入手机号/用户名/邮箱',
						icon: 'none',
						duration: 3000
					});
				}
				if (this.needCaptcha && this.captcha.length != 4) {
					this.$refs.captcha.getImageCaptcha()
					return uni.showToast({
						title: '请输入验证码',
						icon: 'none',
						duration: 3000
					});
				}

				if (this.needAgreements && !this.agree) {
					return this.$refs.agreements.popup(this.pwdLogin)
				}

				let data = {
					"password": this.password,
					"captcha": this.captcha
				}

				if (/^1\d{10}$/.test(this.username)) {
					data.mobile = this.username
				} else if (/@/.test(this.username)) {
					data.email = this.username
				} else {
					data.username = this.username
				}

				uniIdCo.login(data).then(e => {
					this.loginSuccess(e)
				}).catch(e => {
					if (e.errCode == 'uni-id-captcha-required') {
						this.needCaptcha = true
					} else if (this.needCaptcha) {
						//登录失败，自动重新获取验证码
						this.$refs.captcha.getImageCaptcha()
					}
				})
			},
			/* 前往注册 */
			toRegister() {
				uni.navigateTo({
					url: this.config.isAdmin ? '/uni_modules/uni-id-pages/pages/register/register-admin' :
						'/uni_modules/uni-id-pages/pages/register/register',
					fail(e) {
						console.error(e);
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.top {
		position: relative;
		padding-bottom: 30rpx;
		width: 100%;
		margin-top: 40rpx;

		.back {
			position: absolute;
			top: 30rpx;
			left: 30rpx;
		}

		.title {
			margin-top: 20rpx;
			text-align: center;
		}
	}

	.container {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		padding-bottom: 30rpx;
	}

	/* 顶部 */
	.logo-box {
		margin-top: 100rpx;
	}

	.logo {
		width: 250rpx;
		border-radius: 20rpx;
	}

	/* 欢迎 */
	.welcome-text {
		margin-top: 30rpx;
		font-size: 32rpx;
		font-weight: bold;
	}

	/* 表单整体往下 */
	.form-box {
		width: 90%;
		margin-top: 80rpx;
		/* 👈 关键：整体下移 */
	}

	.form-title {
		font-size: 28rpx;
		margin-bottom: 30rpx;
	}



	/* 验证码行 */
	.code-row {
		display: flex;
		align-items: center;
		border-radius: 35rpx;
		overflow: hidden;
		margin-bottom: 30rpx;
	}

	.code-input {
		flex: 1;
		margin-right: 20rpx;
	}

	/* 获取验证码 */
	.code-btn {
		padding: 0 30rpx;
		height: 70rpx;
		line-height: 70rpx;
		background-color: #ffe082;
		border-radius: 35rpx;
		font-size: 24rpx;
	}

	.code-btn.disabled {
		background-color: #ddd;
		color: #999;
	}

	/* 登录按钮 */
	.login-btn {
		width: 100%;
		height: 80rpx;
		background-color: #8fd19e;
		border-radius: 40rpx;
		color: #fff;
		font-size: 30rpx;
		margin-top: 40rpx;
	}

	/* 其他登录 */
	.other-login {
		margin-top: 80rpx;
		text-align: center;
	}

	.other-text {
		font-size: 24rpx;
		color: #999;
		margin-bottom: 20rpx;
	}

	.wechat {
		width: 70rpx;
		height: 70rpx;
	}

	.link-box {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		justify-content: flex-end;
		margin-top: 20px;
		width: 100%;
		padding: 0 40rpx;
	}

	.link {
		font-size: 12px;
	}

	.forget {
		font-size: 12px;
		color: #8a8f8b;
	}
</style>