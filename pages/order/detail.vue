<!-- 订单详情 -->
<template>
  <s-layout title="订单详情" class="index-wrap" navbar="inner">
    <!-- 订单状态 TODO -->
    <view
      class="state-box ss-flex-col ss-col-center ss-row-right"
      :style="[
        {
          marginTop: '-' + Number(statusBarHeight + 88) + 'rpx',
          paddingTop: Number(statusBarHeight + 88) + 'rpx',
        },
      ]"
    >
      <view class="ss-flex ss-m-t-32 ss-m-b-20">
        <image v-if="state.orderInfo.status === 'SUCCUSS'" class="state-img" :src="sheep.$url.cdn('/img/order_loading.png')"></image>
        <image v-if="state.orderInfo.status == 'SUCCUSS'" class="state-img" :src="sheep.$url.cdn('/img/order_success.png')"></image>
        <image v-if="state.orderInfo.status == 'CLOSED'" class="state-img" :src="sheep.$url.cdn('/img/order_close.png')"></image>
        <image v-if="state.orderInfo.status_code == 'noget'" class="state-img" :src="sheep.$url.cdn('/img/order_express.png')"></image>
        <view class="ss-font-30">{{ formatOrderStatus(state.orderInfo) }}</view>
      </view>
      <view class="ss-font-26 ss-m-x-20 ss-m-b-70">
        {{ formatOrderStatusDescription(state.orderInfo) }}
      </view>
    </view>

    <view class="detail-goods" :style="[{ marginTop: state.orderInfo.receiverAreaId > 0 ? '0' : '-40rpx' }]">
      <!-- 订单信 -->
      <view class="order-list">
        <view class="order-card">
          <s-goods-item
            @tap="onGoodsDetail(state.orderInfo?.tourId)"
            :img="state.orderInfo?.picUrl"
            :title="state.orderInfo?.description"
            :skuText="relaceHtml(state.orderInfo?.shorten || '')"
            :price="state.orderInfo?.orderAmount || 0"
          >
            <template #tool>
              <view class="ss-flex">
                <button class="ss-reset-button apply-btn" v-if="state.orderInfo.status == 'SUCCESS' && state.orderInfo.refundRequested == 0" @tap="onRefund(state.orderInfo.id)">
                  申请退款
                </button>
                <button class="ss-reset-button apply-btn" v-if="state.orderInfo.refundRequested > 0">退款中</button>
                <button class="ss-reset-button apply-btn" v-if="state.orderInfo.refundAmount > 0">退款成功</button>
              </view>
            </template>
          </s-goods-item>
        </view>
      </view>
    </view>

    <!-- 订单信息 -->
    <view class="notice-box">
      <view class="notice-box__content">
        <view class="notice-item--center">
          <view class="ss-flex ss-flex-1">
            <text class="title">订单编号：</text>
            <text class="detail">{{ state.orderInfo.id }}</text>
          </view>
          <button class="ss-reset-button copy-btn" @tap="onCopy">复制</button>
        </view>
        <view class="notice-item">
          <text class="title">下单时间：</text>
          <text class="detail">
            {{ sheep.$helper.timeFormat(state.orderInfo.dt, 'yyyy-mm-dd hh:MM:ss') }}
          </text>
        </view>
        <view class="notice-item" v-if="state.orderInfo.paySuccessDate">
          <text class="title">支付时间：</text>
          <text class="detail">
            {{ sheep.$helper.timeFormat(state.orderInfo.paySuccessDate, 'yyyy-mm-dd hh:MM:ss') }}
          </text>
        </view>
        <view class="notice-item">
          <text class="title">支付方式：</text>
          <text class="detail">{{ state.orderInfo.payType || '-' }}</text>
        </view>
      </view>
    </view>

    <!-- 价格信息 -->
    <view class="order-price-box">
      <view class="notice-item ss-flex ss-row-between">
        <text class="title">商品总额</text>
        <view class="ss-flex">
          <text class="detail">￥{{ fen2yuan(state.orderInfo?.orderAmount || 0) }}</text>
        </view>
      </view>
      <view class="notice-item ss-flex ss-row-between" v-if="state.orderInfo.couponPrice > 0">
        <text class="title">优惠劵金额</text>
        <text class="detail">-¥{{ fen2yuan(state.orderInfo.couponPrice) }}</text>
      </view>
      <view class="notice-item ss-flex ss-row-between" v-if="state.orderInfo.pointPrice > 0">
        <text class="title">积分抵扣</text>
        <text class="detail">-¥{{ fen2yuan(state.orderInfo.pointPrice) }}</text>
      </view>
      <view class="notice-item ss-flex ss-row-between" v-if="state.orderInfo.discountPrice > 0">
        <text class="title">活动优惠</text>
        <text class="detail">¥{{ fen2yuan(state.orderInfo.discountPrice) }}</text>
      </view>
      <view class="notice-item ss-flex ss-row-between" v-if="state.orderInfo.vipPrice > 0">
        <text class="title">会员优惠</text>
        <text class="detail">-¥{{ fen2yuan(state.orderInfo.vipPrice) }}</text>
      </view>
      <view class="notice-item all-rpice-item ss-flex ss-m-t-20">
        <text class="title">{{ state.orderInfo.payAmount > 0 ? '已付款' : '需付款' }}</text>
        <text class="detail all-price">￥{{ fen2yuan(state.orderInfo?.orderAmount || 0) }}</text>
      </view>
      <view class="notice-item all-rpice-item ss-flex ss-m-t-20" v-if="state.orderInfo.refundAmount > 0">
        <text class="title">已退款</text>
        <text class="detail all-price">￥{{ fen2yuan(state.orderInfo.refundAmount) }}</text>
      </view>
    </view>

    <!-- 底部按钮 -->
    <!-- TODO: 查看物流、等待成团、评价完后返回页面没刷新页面 -->
    <su-fixed bottom placeholder bg="bg-white" v-if="state.orderInfo.buttons?.length">
      <view class="footer-box ss-flex ss-col-center ss-row-right">
        <button class="ss-reset-button cancel-btn" v-if="state.orderInfo.buttons?.includes('cancel')" @tap="onCancel(state.orderInfo.id)">取消订单</button>
        <button class="ss-reset-button pay-btn ui-BG-Main-Gradient" v-if="state.orderInfo.buttons?.includes('pay')" @tap="onPay(state.orderInfo.id)">继续支付</button>
        <button
          class="ss-reset-button cancel-btn"
          v-if="state.orderInfo.buttons?.includes('combination')"
          @tap="
            sheep.$router.go('/pages/activity/groupon/detail', {
              id: state.orderInfo.combinationRecordId,
            })
          "
        >
          拼团详情
        </button>
        <button class="ss-reset-button cancel-btn" v-if="state.orderInfo.buttons?.includes('express')" @tap="onExpress(state.orderInfo.id)">查看物流</button>
        <button class="ss-reset-button cancel-btn" v-if="state.orderInfo.buttons?.includes('confirm')" @tap="onConfirm(state.orderInfo.id)">确认收货</button>
        <button class="ss-reset-button cancel-btn" v-if="state.orderInfo.buttons?.includes('comment')" @tap="onComment(state.orderInfo.id)">评价</button>
      </view>
    </su-fixed>
  </s-layout>
</template>

<script setup>
import sheep from '@/sheep';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { reactive, ref } from 'vue';
import { isEmpty } from 'lodash-es';
import { fen2yuan, formatOrderStatus, formatOrderStatusDescription, handleOrderButtons } from '@/sheep/hooks/useGoods';
import OrderApi from '@/sheep/api/trade/order';

const statusBarHeight = sheep.$platform.device.statusBarHeight * 2;
const headerBg = sheep.$url.css('/img/order_bg.png');

const state = reactive({
  orderInfo: {},
  merchantTradeNo: '', // 商户订单号
  comeinType: '', // 进入订单详情的来源类型
});

// ========== 门店自提（核销） ==========
const systemStore = ref({}); // 门店信息

// 复制
const onCopy = () => {
  sheep.$helper.copyText(state.orderInfo.id);
};

// 去支付
function onPay(payOrderId) {
  sheep.$router.go('/pages/pay/index', {
    id: payOrderId,
  });
}

// 查看商品
function onGoodsDetail(id) {
  sheep.$router.go('/pages/goods/index', {
    id,
  });
}

function relaceHtml(html) {
  return html.replace(/<br>/g, '').replace(/<b>/g, '').replace(/<\/b>/g, '');
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
        await getOrderDetail(orderId);
      }
    },
  });
}

// 申请退款
async function onRefund(orderId) {
  const { code } = await OrderApi.refund(orderId);
  if (code === 0) {
    await getOrderDetail(orderId);
  }
}

// 查看物流
async function onExpress(id) {
  sheep.$router.go('/pages/order/express/log', {
    id,
  });
}

// 确认收货
async function onConfirm(orderId, ignore = false) {
  // 需开启确认收货组件
  // todo: 芋艿：待接入微信
  // 1.怎么检测是否开启了发货组件功能？如果没有开启的话就不能在这里return出去
  // 2.如果开启了走mpConfirm方法,需要在App.vue的show方法中拿到确认收货结果
  let isOpenBusinessView = true;
  if (sheep.$platform.name === 'WechatMiniProgram' && !isEmpty(state.orderInfo.wechat_extra_data) && isOpenBusinessView && !ignore) {
    mpConfirm(orderId);
    return;
  }

  uni.showModal({
    title: '提示',
    content: '确认收货吗？',
    success: async function (res) {
      if (!res.confirm) {
        return;
      }
      // 正常的确认收货流程
      const { code } = await OrderApi.receiveOrder(orderId);
      if (code === 0) {
        await getOrderDetail(orderId);
      }
    },
  });
}

// #ifdef MP-WEIXIN
// 小程序确认收货组件
function mpConfirm(orderId) {
  if (!wx.openBusinessView) {
    sheep.$helper.toast(`请升级微信版本`);
    return;
  }
  wx.openBusinessView({
    businessType: 'weappOrderConfirm',
    extraData: {
      merchant_trade_no: state.orderInfo.wechat_extra_data.merchant_trade_no,
      transaction_id: state.orderInfo.wechat_extra_data.transaction_id,
    },
    success(response) {
      console.log('success:', response);
      if (response.errMsg === 'openBusinessView:ok') {
        if (response.extraData.status === 'success') {
          onConfirm(orderId, true);
        }
      }
    },
    fail(error) {
      console.log('error:', error);
    },
    complete(result) {
      console.log('result:', result);
    },
  });
}

// #endif

// 评价
function onComment(id) {
  sheep.$router.go('/pages/goods/comment/add', {
    id,
  });
}

async function getOrderDetail(id) {
  // 对详情数据进行适配
  let res;
  if (state.comeinType === 'wechat') {
    // TODO 芋艿：微信场景下
    res = await OrderApi.getOrderDetail(id, {
      merchant_trade_no: state.merchantTradeNo,
    });
  } else {
    res = await OrderApi.getOrderDetail(id);
  }
  if (res.code === 0) {
    state.orderInfo = res.data;
    handleOrderButtons(state.orderInfo);
  }
}

onShow(async () => {
  //onShow中获取订单列表,保证跳转后页面为最新状态
  await getOrderDetail(state.orderInfo.id);
});

onLoad(async (options) => {
  let id = 0;
  if (options.id) {
    id = options.id;
  }
  // TODO 芋艿：下面两个变量，后续接入
  state.comeinType = options.comein_type;
  if (state.comeinType === 'wechat') {
    state.merchantTradeNo = options.merchant_trade_no;
  }
  state.orderInfo.id = id;
});
</script>

<style lang="scss" scoped>
.score-img {
  width: 36rpx;
  height: 36rpx;
  margin: 0 4rpx;
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

.state-box {
  color: rgba(#fff, 0.9);
  width: 100%;
  background:
    v-bind(headerBg) no-repeat,
    linear-gradient(90deg, var(--ui-BG-Main), var(--ui-BG-Main-gradient));
  background-size: 750rpx 100%;
  box-sizing: border-box;

  .state-img {
    width: 60rpx;
    height: 60rpx;
    margin-right: 20rpx;
  }
}

.order-address-box {
  background-color: #fff;
  border-radius: 10rpx;
  margin: -50rpx 20rpx 16rpx 20rpx;
  padding: 44rpx 34rpx 42rpx 20rpx;
  font-size: 30rpx;
  box-sizing: border-box;
  font-weight: 500;
  color: rgba(51, 51, 51, 1);

  .address-username {
    margin-right: 20rpx;
  }

  .address-detail {
    font-size: 26rpx;
    font-weight: 500;
    color: rgba(153, 153, 153, 1);
    margin-top: 20rpx;
  }
}

.detail-goods {
  border-radius: 10rpx;
  margin: 0 20rpx 20rpx 20rpx;

  .order-list {
    margin-bottom: 20rpx;
    background-color: #fff;

    .order-card {
      padding: 20rpx 0;

      .order-sku {
        font-size: 24rpx;

        font-weight: 400;
        color: rgba(153, 153, 153, 1);
        width: 450rpx;
        margin-bottom: 20rpx;

        .order-num {
          margin-right: 10rpx;
        }
      }

      .tag-btn {
        margin-left: 16rpx;
        font-size: 24rpx;
        height: 36rpx;
        color: var(--ui-BG-Main);
        border: 2rpx solid var(--ui-BG-Main);
        border-radius: 14rpx;
        padding: 0 4rpx;
      }
    }
  }
}

// 订单信息。
.notice-box {
  background: #fff;
  border-radius: 10rpx;
  margin: 0 20rpx 20rpx 20rpx;

  .notice-box__head {
    font-size: 30rpx;

    font-weight: 500;
    color: rgba(51, 51, 51, 1);
    line-height: 80rpx;
    border-bottom: 1rpx solid #dfdfdf;
    padding: 0 25rpx;
  }

  .notice-box__content {
    padding: 20rpx;

    .self-pickup-box {
      width: 100%;

      .self-pickup--img {
        width: 200rpx;
        height: 200rpx;
        margin: 40rpx 0;
      }
    }
  }

  .notice-item,
  .notice-item--center {
    display: flex;
    align-items: center;
    line-height: normal;
    margin-bottom: 24rpx;

    .title {
      font-size: 28rpx;
      color: #999;
    }

    .detail {
      font-size: 28rpx;
      color: #333;
      flex: 1;
    }
  }
}

.copy-btn {
  width: 100rpx;
  line-height: 50rpx;
  border-radius: 25rpx;
  padding: 0;
  background: rgba(238, 238, 238, 1);
  font-size: 22rpx;
  font-weight: 400;
  color: rgba(51, 51, 51, 1);
}

// 订单价格信息
.order-price-box {
  background-color: #fff;
  border-radius: 10rpx;
  padding: 20rpx;
  margin: 0 20rpx 20rpx 20rpx;

  .notice-item {
    line-height: 70rpx;

    .title {
      font-size: 28rpx;
      color: #999;
    }

    .detail {
      font-size: 28rpx;
      color: #333;
      font-family: OPPOSANS;
    }
  }

  .all-rpice-item {
    justify-content: flex-end;
    align-items: center;

    .title {
      font-size: 26rpx;
      font-weight: 500;
      color: #333333;
      line-height: normal;
    }

    .all-price {
      font-size: 26rpx;
      font-family: OPPOSANS;
      line-height: normal;
      color: $red;
    }
  }
}

// 底部
.footer-box {
  height: 100rpx;
  width: 100%;
  box-sizing: border-box;
  border-radius: 10rpx;
  padding-right: 20rpx;

  .cancel-btn {
    width: 160rpx;
    height: 60rpx;
    background: #eeeeee;
    border-radius: 30rpx;
    margin-right: 20rpx;
    font-size: 26rpx;
    font-weight: 400;
    color: #333333;
  }

  .pay-btn {
    width: 160rpx;
    height: 60rpx;
    font-size: 26rpx;
    border-radius: 30rpx;
    font-weight: 500;
    color: #fff;
  }
}
</style>
