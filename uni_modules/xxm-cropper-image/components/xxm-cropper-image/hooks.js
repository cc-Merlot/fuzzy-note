import { ref, nextTick, computed, onMounted, watch } from 'vue';

export function useCropper(cropperRef, props) {
	const options = ref({
		outputType: 'webp',
		autoCrop: true,
		fixed: false,
		fixedNumber: [9, 16],
		infoTrue: true,
		full: true,
		maxImgSize: 3000,
		fillColor: '#000',
		active: 0
	});

	const fnConfig = ref([
		{ type: 'auto', text: '自由裁剪', icon: 'icon-expend' },
		{ type: '1/1', text: '1 / 1', icon: '' },
		{ type: '9/16', text: '9 / 16', icon: '' },
		{ type: '9/20', text: '9 / 20', icon: '' },
		{ type: '16/9', text: '16 / 9', icon: '' },
		{ type: 'rotate', text: '向右旋转', icon: 'icon-rotate-right' },
		{ type: 'zoomin', text: '放大', icon: 'icon-zoomin' },
		{ type: 'zoomout', text: '缩小', icon: 'icon-zoomout' }
	]);

	const formatRatioType = computed(() => {
		return props.ratio.replace(/\s+/g, ''); // 把 "16 / 9" 转为 "16/9"
	});

	const editImg = (type, index) => {
		// 第二步：判断当前点击的是否是自定义比例项
		const isCustomRatio = type === formatRatioType.value;
		switch (type) {
			case 'rotate':
				return cropperRef.value.rotateRight();
			case 'zoomin':
				return cropperRef.value.changeScale();
			case 'zoomout':
				return cropperRef.value.changeScale(-1);
			case 'auto':
				options.value.fixed = false;
				options.value.active = index;
				break;
			case '1/1':
			case '9/16':
			case '9/20':
			case '16/9':
			case formatRatioType.value: // 追加自定义比例类型
				options.value.fixed = true;
				// 兼容：自定义比例的text是带空格的（如"16 / 9"），原比例是无空格的
				const ratioText = isCustomRatio
					? props.ratio // 自定义比例直接用props的text
					: fnConfig.value.find((find) => find.type === type).text;
				const ratio = ratioText.split(/\s*\/\s*/); // 兼容有/无空格的分割（如"16/9"或"16 / 9"）
				options.value.fixedNumber = ratio.map(Number); // 转为数字数组（避免字符串）
				options.value.active = index;
				break;
			default:
				// 可以在这里处理其他情况或者不处理
				break;
		}
		nextTick(() => {
			cropperRef.value.goAutoCrop();
		});
	};

	return {
		options,
		fnConfig,
		editImg
	};
}
