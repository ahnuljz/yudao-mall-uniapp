<!-- 首页，支持店铺装修 -->
<template>
  <view v-if="template && !loading">
    <s-layout title="首页" navbar="custom" tabbar="/pages/index/index" :bgStyle="template.page" :navbarStyle="template.navigationBar" onShareAppMessage>
      <s-block v-for="(item, index) in template.components" :key="index" :styles="item.property.style">
        <s-block-item :type="item.id" :data="item.property" :styles="item.property.style" />
      </s-block>
    </s-layout>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import { onLoad, onPageScroll, onPullDownRefresh } from '@dcloudio/uni-app';
import sheep from '@/sheep';
import $share from '@/sheep/platform/share';
import { storeId } from '@/sheep/config';
// 隐藏原生tabBar
uni.hideTabBar({
  fail: () => {},
});
const loading = ref(false);

const template = computed(() => sheep.$store('app').template?.home);
// 在此处拦截改变一下首页轮播图 此处先写死后期复活 放到启动函数里
// (async function() {
// console.log('原代码首页定制化数据',template)
// let {
// 	data
// } = await index2Api.decorate();
// console.log('首页导航配置化过高无法兼容',JSON.parse(data[1].value))
// 改变首页底部数据 但是没有通过数组id获取商品数据接口
// let {
// 	data: datas
// } = await index2Api.spids();
// template.value.data[9].data.goodsIds = datas.list.map(item => item.id);
// template.value.data[0].data.list = JSON.parse(data[0].value).map(item => {
// 	return {
// 		src: item.picUrl,
// 		url: item.url,
// 		title: item.name,
// 		type: "image"
// 	}
// })
// }())

onLoad((options) => {
  // #ifdef MP
  // 小程序识别二维码
  if (options.scene) {
    const sceneParams = decodeURIComponent(options.scene).split('=');
    console.log('sceneParams=>', sceneParams);
    options[sceneParams[0]] = sceneParams[1];
  }
  // #endif

  // 解析门店信息
  uni.setStorageSync('ref', options.storeId ? '1' + options.storeId : '');

  // 预览模板
  if (options.templateId) {
    sheep.$store('app').init(options.templateId);
  }

  // 解析分享信息
  if (options.spm) {
    $share.decryptSpm(options.spm);
  }

  // 进入指定页面(完整页面路径)
  if (options.page) {
    sheep.$router.go(decodeURIComponent(options.page));
  }
});

// 下拉刷新
onPullDownRefresh(async () => {
  loading.value = true;
  uni.showLoading({
    title: '正在刷新...',
    mask: true,
    fail: () => {
      uni.hideLoading();
    },
  });
  await sheep.$store('app').init();
  setTimeout(function () {
    uni.stopPullDownRefresh();
    loading.value = false;
    uni.hideLoading();
  }, 800);
});

onPageScroll(() => {});
</script>

<style></style>
