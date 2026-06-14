<template>
	<view class="layout backgound">
		<view class="pet">
			<status-bar />
			<common-title :title="editType + '宠物'"></common-title>
			<view class="container">
				<view class="forms">
					<uni-forms ref="baseForm" :modelValue="baseFormData" :rules="rules">
						<uni-forms-item label="姓名" name="name" required>
							<uni-easyinput v-model="baseFormData.name" placeholder="请输入姓名" />
						</uni-forms-item>
						<uni-forms-item label="性别" name="gender" required>
							<uni-data-checkbox v-model="baseFormData.gender" :localdata="sexs" />
						</uni-forms-item>
						<uni-forms-item label="头像">
							<view class="box">
								<view class="inner">
									<image v-if="baseFormData.avatar" :src="baseFormData.avatar" mode="aspectFill">
									</image>
									<image v-else :src="commonImage.animalDefPic" mode="aspectFill"></image>
									<button @click="onChooseAvatar" class="btn">按钮</button>
									<view class="mask" v-if="uploadState">
										上传中
									</view>
								</view>
								<view class="icon">
									<uni-icons type="camera" color="#fff" size="16"></uni-icons>
								</view>
							</view>
						</uni-forms-item>

						<uni-forms-item label="体重">
							<view style="width: 250rpx;">
								<uni-easyinput type="number" v-model.number="baseFormData.weight" placeholder="请输入体重">
									<template #right>
										<view class="kg">kg</view>
									</template>
								</uni-easyinput>
							</view>

						</uni-forms-item>

						<uni-forms-item label="种类">
							<uni-easyinput v-model="baseFormData.breed" placeholder="请输入种类" />
						</uni-forms-item>
						<uni-forms-item label="出生日期">
							<uni-datetime-picker type="datetime" return-type="timestamp"
								v-model="baseFormData.birthday" />
						</uni-forms-item>
						<uni-forms-item label="是否绝育">
							<uv-switch v-model="baseFormData.isCutBall" inactive-color="#f3f4f6"
								active-color="#ffeb3b"></uv-switch>
						</uni-forms-item>
						<uni-forms-item label="性格">
							<uni-easyinput type="textarea" v-model="baseFormData.personality"
								placeholder="请输入性格"></uni-easyinput>
						</uni-forms-item>
					</uni-forms>

					<view class="addBtn">
						<button class="btn" @click="submitForm">{{ editType }}</button>
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
	import {
		uploadFileItem
	} from '/utils/common'
	import {
		onLoad
	} from '@dcloudio/uni-app'
	import {
		usePetStore
	} from '@/store/pet'
	import XEUtils from 'xe-utils'

	const petStore = usePetStore()
	const petCloudObj = uniCloud.importObject("client-pet", {
		customUI: true
	})

	const baseForm = ref(null)
	const editType = ref('添加')
	const baseFormData = ref({
		avatar: '',
		gender: 2
	})

	const sexs = ref([{
			text: '公',
			value: 0
		}, {
			text: '母',
			value: 1
		},
		{
			text: '未知',
			value: 2
		}
	])

	const uploadState = ref(false)

	const rules = {
		// 对name字段进行必填验证
		name: {
			rules: [{
					required: true,
					errorMessage: '姓名必填',
				},
				{
					minLength: 1,
					maxLength: 8,
					errorMessage: '姓名长度在 {minLength} 到 {maxLength} 个字符',
				}
			]
		},
		gender: {
			rules: [{
				required: true,
				errorMessage: '性别必填',
			}]
		}
	}

	onLoad((e) => {
		let {
			id
		} = e
		if (id) {
			editType.value = '修改'
			getData(id)
		}
	})

	const getData = async (id) => {
		try {
			uni.showLoading({
				title: '加载中...',
				mask: true
			})
			let {
				errCode,
				data
			} = await petCloudObj.detail(id)
			if (errCode !== 0) return uni.showToast({
				title: '获取数据失败',
				icon: 'none'
			})
			baseFormData.value = data
		} catch (err) {
			uni.showToast({
				title: '获取数据失败',
				icon: 'none'
			})
			console.log(err)
		} finally {
			uni.hideLoading()
		}

	}

	// 提交表单
	const submitForm = async () => {
		try {
			baseForm.value.validate()
			try {
				uni.showLoading({
					title: '加载中...',
					mask: true
				})
				let {
					errCode,
					data
				} = baseFormData.value._id ? await petCloudObj.update(baseFormData.value) : await petCloudObj.add(
					baseFormData.value)
				if (errCode !== 0) return uni.showToast({
					title: editType.value + '失败',
					icon: 'none'
				})
				// 先显示成功提示
				uni.showToast({
					title: editType.value + '成功',
					icon: 'none',
					duration: 1500
				});
				if (!XEUtils.isEmpty(petStore.indexCurrentPet) && baseFormData.value._id == petStore
					.indexCurrentPet._id) {
					petStore.indexCurrentPet = baseFormData.value
				}
				// 延迟返回，让用户看到提示
				setTimeout(() => {
					uni.navigateBack();
				}, 1500);
			} catch (error) {
				console.log(error)
				uni.showToast({
					title: editType.value + '失败',
					icon: 'none',
				})
			} finally {
				uni.hideLoading()
			}
		} catch (err) {
			console.log(err);
			uni.showToast({
				title: '请正确输入表单',
				icon: 'none'
			})
		}
	}

	// 选择图片
	const onChooseAvatar = async () => {
		try {
			// 1. 将 uni.chooseImage 包装成 Promise
			const chooseResult = await new Promise((resolve, reject) => {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album'],
					success: resolve,
					fail: reject
				});
			});

			// 2. 获取图片路径
			const tempImg = chooseResult.tempFilePaths[0];

			uploadState.value = true;

			// 3. 上传图片
			const {
				fileID
			} = await uploadFileItem(tempImg, 'avatar');

			// 4. 更新表单数据
			baseFormData.value.avatar = fileID;

		} catch (err) {
			console.error('选择或上传头像失败:', err);
			uni.showToast({
				title: '选择头像失败',
				icon: 'none',
			});


		} finally {
			uploadState.value = false;
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		padding: 30rpx;

		.forms {
			background-color: #fff;
			border: 3rpx solid #000;
			border-radius: 30rpx;
			padding: 23rpx;

			.box {
				height: 160rpx;
				width: 160rpx;
				position: relative;

				.inner {
					width: 100%;
					height: 100%;
					position: absolute;
					top: 0;
					left: 0;

					image {
						width: 100%;
						height: 100%;
						border-radius: 50%;
					}

					.btn {
						position: absolute;
						top: 0;
						left: 0;
						width: 100%;
						height: 100%;
						border-radius: 50%;
						opacity: 0;
						margin: 0;
					}

					.mask {
						position: absolute;
						background: rgba(0, 0, 0, 0.6);
						border-radius: 50%;
						color: #fff;
						top: 0;
						left: 0;
						width: 100%;
						height: 100%;
						display: flex;
						justify-content: center;
						align-items: center;
						font-size: 22rpx;
					}
				}

				.icon {
					width: 50rpx;
					height: 50rpx;
					background: #ffeb3b;
					border-radius: 50%;
					display: flex;
					justify-content: center;
					align-items: center;
					border: 2px solid #fff;
					position: absolute;
					right: 0;
					bottom: 0;
					pointer-events: none;
				}

				.text {
					font-size: 25rpx;
					color: #999;
					white-space: nowrap;
					text-align: center;
					position: absolute;
					bottom: -40rpx;
					left: 0;
				}
			}

			.addBtn {
				margin-top: 20rpx;

				.btn {
					background-color: #ffeb3b;
				}
			}

			.kg {
				padding: 0 10rpx;
				font-size: 22rpx;
				color: #999;
			}

		}
	}
</style>