<!-- 订单列表 -->
<template>
  <s-layout title="我的订单">
    <su-sticky bgColor="#fff">
      <su-tabs :list="tabMaps" :scrollable="false" @change="onTabsChange" :current="state.currentTab" />
    </su-sticky>
    <s-empty v-if="state.pagination.total === 0" :icon="sheep.$url.cdn('/static/order-empty.png')" text="暂无订单" />
    <view v-if="state.pagination.total > 0">
      <view
        class="bg-white order-list-card-box ss-r-10 ss-m-t-14 ss-m-20"
        v-for="order in state.pagination.list"
        :key="order.id"
        @tap="onOrderDetail(order.id)"
      >
        <view class="order-card-header ss-flex ss-col-center ss-row-between ss-p-x-20">
          <view class="order-no">订单编号：{{ order.id }}</view>
          <view class="order-state ss-font-26" :class="formatOrderColor(order)">
            {{ formatOrderStatus(order) }}
          </view>
        </view>
        <view class="border-bottom">
          <s-goods-item
            :img="order.picUrl"
            :title="order.description"
            :skuText="relaceHtml(order.shorten)"
            :price="order.orderAmount"
          />
        </view>
        <view class="pay-box ss-m-t-30 ss-flex ss-row-right ss-p-r-20">
          <view class="ss-flex ss-col-center">
            <view class="discounts-title pay-color">共 {{ order.tourists.length }} 位游客,总金额:</view>
            <view class="discounts-money pay-color"> ￥{{ fen2yuan(order.orderAmount) }} </view>
          </view>
        </view>
        <view
          class="order-card-footer ss-flex ss-col-center ss-p-x-20"
          :class="order.buttons.length > 3 ? 'ss-row-between' : 'ss-row-right'"
        >
          <view class="ss-flex ss-col-center">
            <button
              v-if="order.buttons.includes('combination')"
              class="tool-btn ss-reset-button"
              @tap.stop="onOrderGroupon(order)"
            >
              拼团详情
            </button>
            <button
              v-if="order.buttons.length === 0"
              class="tool-btn ss-reset-button"
              @tap.stop="onOrderDetail(order.id)"
            >
              查看详情
            </button>
            <button
              v-if="order.buttons.includes('confirm')"
              class="tool-btn ss-reset-button"
              @tap.stop="onConfirm(order)"
            >
              确认收货
            </button>
            <button
              v-if="order.buttons.includes('express')"
              class="tool-btn ss-reset-button"
              @tap.stop="onExpress(order.id)"
            >
              查看物流
            </button>
            <button
              v-if="order.buttons.includes('cancel')"
              class="tool-btn ss-reset-button"
              @tap.stop="onCancel(order.id)"
            >
              取消订单
            </button>
            <button
              v-if="order.buttons.includes('comment')"
              class="tool-btn ss-reset-button"
              @tap.stop="onComment(order.id)"
            >
              评价
            </button>
            <button
              v-if="order.buttons.includes('delete')"
              class="delete-btn ss-reset-button"
              @tap.stop="onDelete(order.id)"
            >
              删除订单
            </button>
            <button
              v-if="order.buttons.includes('pay')"
              class="tool-btn ss-reset-button ui-BG-Main-Gradient"
              @tap.stop="onPay(order.payOrderId)"
            >
              继续支付
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载更多 -->
    <uni-load-more
      v-if="state.pagination.total > 0"
      :status="state.loadStatus"
      :content-text="{
        contentdown: '上拉加载更多',
      }"
      @tap="loadMore"
    />
  </s-layout>
</template>

<script setup>
  import { reactive } from 'vue';
  import { onLoad, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app';
  import { fen2yuan, formatOrderColor, formatOrderStatus, handleOrderButtons } from '@/sheep/hooks/useGoods';
  import sheep from '@/sheep';
  import _ from 'lodash-es';
  import { isEmpty } from 'lodash-es';
  import OrderApi from '@/sheep/api/trade/order';
  import { resetPagination } from '@/sheep/util';

  // 数据
  const state = reactive({
    currentTab: 0, // 选中的 tabMaps 下标
    pagination: {
      list: [],
      total: 0,
      pageNo: 1,
      pageSize: 5,
    },
    loadStatus: '',
  });

  const tabMaps = [
    {
      name: '全部',
    },
    {
      name: '待付款',
      value: 'PAYING',
    },
    {
      name: '已付款',
      value: 'SUCCESS',
    },
    {
      name: '已过期',
      value: 'TIME_OUT',
    }
  ];

  // 切换选项卡
  function onTabsChange(e) {
    if (state.currentTab === e.index) {
      return;
    }
    // 重头加载代码
    resetPagination(state.pagination);
    state.currentTab = e.index;
    getOrderList();
  }

  function relaceHtml(html) {
    return html.replace(/<br>/g, '').replace(/<b>/g, '').replace(/<\/b>/g, '');
  }

  // 订单详情
  function onOrderDetail(id) {
    sheep.$router.go('/pages/order/detail', {
      id,
    });
  }

  // 跳转拼团记录的详情
  function onOrderGroupon(order) {
    sheep.$router.go('/pages/activity/groupon/detail', {
      id: order.combinationRecordId,
    });
  }

  // 继续支付
  function onPay(payOrderId) {
    sheep.$router.go('/pages/pay/index', {
      id: payOrderId,
    });
  }

  // 评价
  function onComment(id) {
    sheep.$router.go('/pages/goods/comment/add', {
      id,
    });
  }

  // 取消订单
  async function onCancel(orderId) {
    uni.showModal({
      title: '提示',
      content: '确定要取消订单吗?',
      success: async function (res) {
        if (!res.confirm) {
          return;
        }
        const { code } = await OrderApi.cancelOrder(orderId);
        if (code === 0) {
          // 修改数据的状态
          let index = state.pagination.list.findIndex((order) => order.id === orderId);
          const orderInfo = state.pagination.list[index];
          orderInfo.status = 40;
          handleOrderButtons(orderInfo);
        }
      },
    });
  }

  // 删除订单
  function onDelete(orderId) {
    uni.showModal({
      title: '提示',
      content: '确定要删除订单吗?',
      success: async function (res) {
        if (res.confirm) {
          const { code } = await OrderApi.deleteOrder(orderId);
          if (code === 0) {
            // 删除数据
            let index = state.pagination.list.findIndex((order) => order.id === orderId);
            state.pagination.list.splice(index, 1);
          }
        }
      },
    });
  }

  // 获取订单列表
  async function getOrderList() {
    state.loadStatus = 'loading';
    let { code, data } = await OrderApi.getOrderPage({
      pageNo: state.pagination.pageNo,
      pageSize: state.pagination.pageSize,
      keyword: tabMaps[state.currentTab].value,
    });
    if (code !== 0) {
      return;
    }
    data.records.forEach((order) => handleOrderButtons(order));
    state.pagination.list = _.concat(state.pagination.list, data.records);
    state.pagination.total = data.totalRow;
    state.loadStatus = state.pagination.list.length < state.pagination.total ? 'more' : 'noMore';
  }

  onLoad(async (options) => {
    if (options.type) {
      state.currentTab = options.type;
    }
    await getOrderList();
  });

  // 加载更多
  function loadMore() {
    if (state.loadStatus === 'noMore') {
      return;
    }
    state.pagination.pageNo++;
    getOrderList();
  }

  // 上拉加载更多
  onReachBottom(() => {
    loadMore();
  });

  // 下拉刷新
  onPullDownRefresh(() => {
    resetPagination(state.pagination);
    getOrderList();
    setTimeout(function () {
      uni.stopPullDownRefresh();
    }, 800);
  });
</script>

<style lang="scss" scoped>
  .score-img {
    width: 36rpx;
    height: 36rpx;
    margin: 0 4rpx;
  }

  .tool-btn {
    width: 160rpx;
    height: 60rpx;
    background: #f6f6f6;
    font-size: 26rpx;
    border-radius: 30rpx;
    margin-right: 10rpx;

    &:last-of-type {
      margin-right: 0;
    }
  }

  .delete-btn {
    width: 160rpx;
    height: 56rpx;
    color: #ff3000;
    background: #fee;
    border-radius: 28rpx;
    font-size: 26rpx;
    margin-right: 10rpx;
    line-height: normal;

    &:last-of-type {
      margin-right: 0;
    }
  }

  .apply-btn {
    width: 140rpx;
    height: 50rpx;
    border-radius: 25rpx;
    font-size: 24rpx;
    border: 2rpx solid #dcdcdc;
    line-height: normal;
    margin-left: 16rpx;
  }

  .swiper-box {
    flex: 1;

    .swiper-item {
      height: 100%;
      width: 100%;
    }
  }

  .order-list-card-box {
    .order-card-header {
      height: 80rpx;

      .order-no {
        font-size: 26rpx;
        font-weight: 500;
      }

      .order-state {
      }
    }

    .pay-box {
      .discounts-title {
        font-size: 24rpx;
        line-height: normal;
        color: #999999;
      }

      .discounts-money {
        font-size: 24rpx;
        line-height: normal;
        color: #999;
        font-family: OPPOSANS;
      }

      .pay-color {
        color: #333;
      }
    }

    .order-card-footer {
      height: 100rpx;

      .more-item-box {
        padding: 20rpx;

        .more-item {
          height: 60rpx;

          .title {
            font-size: 26rpx;
          }
        }
      }

      .more-btn {
        color: $dark-9;
        font-size: 24rpx;
      }

      .content {
        width: 154rpx;
        color: #333333;
        font-size: 26rpx;
        font-weight: 500;
      }
    }
  }

  :deep(.uni-tooltip-popup) {
    background: var(--ui-BG);
  }

  .warning-color {
    color: #faad14;
  }

  .danger-color {
    color: #ff3000;
  }

  .success-color {
    color: #52c41a;
  }

  .info-color {
    color: #999999;
  }
</style>
