<!-- 装修用户组件：用户卡券 -->
<template>
  <view class="ss-coupon-menu-wrap ss-flex ss-col-center" :style="[bgStyle, { marginLeft: `${data.space}px` }]">
    <view
      class="menu-item ss-flex-1 ss-flex-col ss-row-center ss-col-center"
      v-for="item in props.list"
      :key="item.title"
      @tap="sheep.$router.go(item.path, { type: item.type })"
    >
      <image class="item-icon" :src="sheep.$url.cdn(item.icon)" mode="aspectFit"></image>
      <view class="menu-title ss-m-t-28">{{ item.title }}</view>
    </view>
  </view>
</template>

<script setup>
  /**
   * 装修组件 - 优惠券菜单
   */
  import sheep from '@/sheep';
  import { computed } from 'vue';

  // 接收参数
  const props = defineProps({
    list: {
      type: Array,
      default() {
        return [
          {
            title: '已领取',
            value: '0',
            icon: '/img/nouse_coupon.png',
            path: '/pages/coupon/list',
            type: 'geted',
          },
          {
            title: '已使用',
            value: '0',
            icon: '/img/useend_coupon.png',
            path: '/pages/coupon/list',
            type: 'used',
          },
          {
            title: '已失效',
            value: '0',
            icon: '/img/out_coupon.png',
            path: '/pages/coupon/list',
            type: 'expired',
          },
          {
            title: '领券中心',
            value: '0',
            icon: '/img/all_coupon.png',
            path: '/pages/coupon/list',
            type: 'all',
          },
        ];
      },
    },
    // 装修数据
    data: {
      type: Object,
      default: () => ({}),
    },
    // 装修样式
    styles: {
      type: Object,
      default: () => ({}),
    },
  });
  // 设置背景样式
  const bgStyle = computed(() => {
    // 直接从 props.styles 解构
    const { bgType, bgImg, bgColor } = props.styles;

    // 根据 bgType 返回相应的样式
    return {
      background: bgType === 'img' ? `url(${bgImg}) no-repeat top center / 100% 100%` : bgColor,
    };
  });
</script>

<style lang="scss" scoped>
  .ss-coupon-menu-wrap {
    .menu-item {
      height: 160rpx;
      position: relative;
      z-index: 10;
      .menu-title {
        font-size: 24rpx;
        line-height: 24rpx;
        color: #333333;
      }
      .item-icon {
        width: 44rpx;
        height: 44rpx;
      }
    }

    .menu-wallet {
      width: 144rpx;
    }
  }
</style>
