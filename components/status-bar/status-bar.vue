<template>
	<view class="status-bar" :style="{ height: topInset + 'px' }"></view>
</template>

<script setup>
	const win = typeof uni.getWindowInfo === 'function'
		? uni.getWindowInfo()
		: uni.getSystemInfoSync()
	const topInset = win.safeAreaInsets?.top ?? win.statusBarHeight ?? 0
</script>

<style scoped>
	.status-bar {
		width: 100%;
	}
</style>
