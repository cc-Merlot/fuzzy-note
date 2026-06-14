<template>
	<uni-popup ref="popup" :is-mask-click="false">
		<view class="popup">
			<view class="cropper">
				<VueCropper
					ref="cropperRef"
					:img="newTempurl"
					:outputType="options.outputType"
					:autoCrop="options.autoCrop"
					:fixed="options.fixed"
					:fixedNumber="options.fixedNumber"
					:infoTrue="options.infoTrue"
					:full="options.full"
					:maxImgSize="maxImgSize"
					:fillColor="options.fillColor"></VueCropper>
			</view>

			<view class="function">
				<view @click="editImg(item.type, index)" class="item" v-for="(item, index) in fnConfig" :key="item.type" :class="options.active == index ? 'active' : ''">
					<text class="iconfont" :class="item.icon" v-if="item.icon"></text>
					<text v-else>{{ item.text }}</text>
				</view>
			</view>

			<view class="popupBtnGroup">
				<button size="mini" type="primary" @click="confirm">确认</button>
				<button size="mini" type="default" @click="close">取消</button>
			</view>
		</view>
	</uni-popup>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import '../vue-cropper/index.css';
import { VueCropper } from '../vue-cropper/vue-cropper.es.js';

import { useCropper } from './hooks.js';

const props = defineProps({
	tempurl: String,
	maxImgSize: {
		type: Number,
		default: 3000
	},
	ratio: {
		type: String,
		default: '16 / 9'
	}
});
const newTempurl = computed(() => (props.tempurl.startsWith('http') ? props.tempurl + '?t=' + Date.now() : props.tempurl));

const emits = defineEmits(['confirm']);
const popup = ref(null);
const cropperRef = ref(null);

const { options, fnConfig, editImg } = useCropper(cropperRef, props);

const open = () => {
	popup.value.open();
};

const close = () => {
	popup.value.close();
};

const confirm = () => {
	cropperRef.value.getCropBlob((data) => {
		emits('confirm', URL.createObjectURL(data));
		close();
	});
};

const formatRatio = (ratio) => ratio.replace(/\s+/g, '');
const addCustomRatio = () => {
	if (!props.ratio) return;
	const customRatioType = formatRatio(props.ratio);
	// 判断原数组是否已存在该比例
	const isExist = fnConfig.value.some((item) => item.type === customRatioType);
	if (isExist) return; // 已存在则不添加
	const customRatioItem = {
		type: customRatioType,
		text: props.ratio,
		icon: ''
	};
	fnConfig.value = fnConfig.value.filter((item) => item.type !== customRatioType);
	fnConfig.value.splice(1, 0, customRatioItem);
};

watch(
	() => props.ratio,
	() => {
		// nextTick确保DOM更新后操作，避免响应式问题
		nextTick(addCustomRatio);
	},
	{ immediate: true } // 立即执行（首次渲染）
);

defineExpose({
	open,
	close
});
</script>

<style lang="scss" scoped>
@import 'https://at.alicdn.com/t/c/font_3801856_s4th09z6vzk.css';
.popup {
	width: 550px;
	background: #fff;
	border-radius: 10px;
	min-height: 300px;
	padding: 20px;
	.cropper {
		width: 100%;
		aspect-ratio: 1 / 1;
	}

	.function {
		padding: 20px 0;
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		.item {
			border: 1px solid #2979ff;
			color: #2979ff;
			padding: 10px;
			font-size: 14px;
			cursor: pointer;
			user-select: none;
			box-sizing: border-box;
			line-height: 1em;
		}
		.item:active {
			transform: scale(0.96);
		}
		.item.active {
			background: rgba(14, 118, 246, 0.15);
		}
	}

	.popupBtnGroup {
		display: flex;
		justify-content: start;
		gap: 20px;
		button {
			margin: 0;
			width: 130px;
		}
	}
}
</style>
