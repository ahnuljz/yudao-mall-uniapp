<!-- 商品详情：描述卡片 -->
<template>
	<uni-group title="详情">
		<mp-html :content="content" />
	</uni-group>
</template>

<script setup>
	import sheep from '@/sheep';
	const {
		safeAreaInsets
	} = sheep.$platform.device;

	const props = defineProps({
		content: {
			type: String,
			default: '',
		},
	});
</script>