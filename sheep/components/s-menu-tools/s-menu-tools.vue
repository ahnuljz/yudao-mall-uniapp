<!-- 全局 - 快捷入口 -->
<template>
  <su-popup :show="show" type="top" round="20" backgroundColor="#F0F0F0" @close="closeMenuTools">
    <su-status-bar />
    <view class="tools-wrap ss-m-x-30 ss-m-b-16">
      <view class="title ss-m-b-34 ss-p-t-20">快捷菜单</view>
      <view class="container-list ss-flex ss-flex-wrap">
        <view class="list-item ss-m-b-24" v-for="item in list" :key="item.title">
          <view class="ss-flex-col ss-col-center">
            <button class="ss-reset-button list-image ss-flex ss-row-center ss-col-center" @tap="onClick(item)">
              <image v-if="show" :src="sheep.$url.cdn(item.icon)" class="list-icon" />
            </button>
            <view class="list-title ss-m-t-20">{{ item.title }}</view>
          </view>
        </view>
      </view>
    </view>
  </su-popup>
</template>

<script setup>
import { reactive, computed } from 'vue';
import sheep from '@/sheep';
import { closeMenuTools } from '@/sheep/hooks/useModal';

const show = computed(() => sheep.$store('modal').menu);

function onClick(item) {
  closeMenuTools();
  if (item.url) sheep.$router.go(item.url);
}

const list = [
  {
    url: '/pages/index/index',
    icon: '/img/home.png',
    title: '首页',
  },
  {
    url: '/pages/index/search',
    icon: '/img/search.png',
    title: '搜索',
  },
  {
    url: '/pages/index/user',
    icon: '/img/user.png',
    title: '个人中心',
  },
  // {
  //   url: '/pages/user/goods-log',
  //   icon: '/img/browse.png',
  //   title: '浏览记录',
  // },
  {
    url: '/pages/user/goods-collect',
    icon: '/img/collect.png',
    title: '我的收藏',
  },
  // {
  //   url: '/pages/chat/index',
  //   icon: '/img/service.png',
  //   title: '客服',
  // },
];
</script>

<style lang="scss" scoped>
.tools-wrap {
  // background: #F0F0F0;
  // box-shadow: 0px 0px 28rpx 7rpx rgba(0, 0, 0, 0.13);
  // opacity: 0.98;
  // border-radius: 0 0 20rpx 20rpx;

  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333333;
  }

  .list-item {
    width: calc(25vw - 20rpx);

    .list-image {
      width: 104rpx;
      height: 104rpx;
      border-radius: 52rpx;
      background: var(--ui-BG);

      .list-icon {
        width: 54rpx;
        height: 54rpx;
      }
    }

    .list-title {
      font-size: 26rpx;
      font-weight: 500;
      color: #333333;
    }
  }
}

.uni-popup {
  top: 0 !important;
}

:deep(.button-hover) {
  background: #fafafa !important;
}
</style>
