<template>
  <view class="ss-modal-box bg-white ss-flex-col">
    <view class="modal-content ss-flex-1">
      <uni-calendar
        :insert="true"
        :lunar="false"
        :date="selected.startDate"
        :start-date="'2025-5-1'"
        :end-date="'2025-6-1'"
        :selected="availList"
        @change="change"
      />
      <view class="sku-item ss-m-b-20 ss-flex ss-col-center ss-flex-wrap" v-for="sku in selected" :key="sku.index">
        <view class="ss-flex">
          <button class="ss-reset-button spec-btn m-[20px]"  @tap="onSelectSku(sku.id, sku.index)">
            {{ sku.name }} ￥{{ sku.marketPrice }}元/位
          </button>
          <su-number-box
            :min="1"
            :max="sku?.stock"
            :step="1"
            v-model="sku.count"
            :key="sku.index"
            @change="onNumberChange($event)"
          />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
  import { computed, ref, onMounted, nextTick, reactive, watch } from 'vue';
  import UniCalendar from '@/uni_modules/uni-calendar/components/uni-calendar/uni-calendar.vue';

  const emits = defineEmits(['change', 'addCart', 'buy', 'close']);
  const props = defineProps({
    goodsInfo: {
      type: Object,
      default() {},
    },
  });

  const availList = computed(() => {
    return props.goodsInfo.plans.map((e) => {
      return {
        date: e.startDate,
        info: '￥' + Math.min(...e.skus.map((f) => f.marketPrice)),
        data: e.skus,
      };
    });
  });

  const selected = ref([]);
  onMounted(() => {
    nextTick(() => {
      const arr = availList.value;
      selected.value = arr && arr.length ? arr[0] : [];
    });
  });

  const change = (d) => {
    console.log(d);
    selected.value = d?.extraInfo?.data ?? [];
  };
  const onSelectSku = (planId, index) => {
    console.log(planId, index);
  };
  const onNumberChange = (planId, index) => {
    console.log(planId, index);
  };
</script>

<style lang="scss" scoped>
  // 购买
  .buy-box {
    padding: 10rpx 0;

    .score-btn {
      width: 100%;
      margin: 0 20rpx;
      height: 80rpx;
      border-radius: 40rpx;
      background: linear-gradient(90deg, var(--ui-BG-Main), var(--ui-BG-Main-gradient));
      color: #fff;
    }
  }

  .ss-modal-box {
    border-radius: 30rpx 30rpx 0 0;
    max-height: 1000rpx;

    .modal-header {
      position: relative;
      padding: 80rpx 20rpx 40rpx;

      .sku-image {
        width: 160rpx;
        height: 160rpx;
        border-radius: 10rpx;
      }

      .header-right {
        height: 160rpx;
      }

      .close-icon {
        position: absolute;
        top: 10rpx;
        right: 20rpx;
        font-size: 46rpx;
        opacity: 0.2;
      }

      .goods-title {
        font-size: 28rpx;
        font-weight: 500;
        line-height: 42rpx;
      }

      .score-img {
        width: 36rpx;
        height: 36rpx;
        margin: 0 4rpx;
      }

      .score-text {
        font-size: 30rpx;
        font-weight: 500;
        color: $red;
        font-family: OPPOSANS;
      }

      .price-text {
        font-size: 30rpx;
        font-weight: 500;
        color: $red;
        font-family: OPPOSANS;

        &::before {
          content: '￥';
          font-size: 30rpx;
          font-weight: 500;
          color: $red;
        }
      }

      .stock-text {
        font-size: 26rpx;
        color: #999999;
      }
    }

    .modal-content {
      padding: 0 20rpx;

      .modal-content-scroll {
        max-height: 600rpx;

        .label-text {
          font-size: 26rpx;
          font-weight: 500;
        }

        .buy-num-box {
          height: 100rpx;
        }

        .spec-btn {
          height: 60rpx;
          min-width: 100rpx;
          padding: 0 30rpx;
          background: #f4f4f4;
          border-radius: 30rpx;
          color: #434343;
          font-size: 26rpx;
          margin-right: 10rpx;
          margin-bottom: 10rpx;
        }

        .disabled-btn {
          font-weight: 400;
          color: #c6c6c6;
          background: #f8f8f8;
        }
      }
    }
  }

  .iconBox {
    width: fit-content;
    height: fit-content;
    padding: 2rpx 10rpx;
    background-color: rgb(255, 242, 241);
    color: #ff2621;
    font-size: 24rpx;
    margin-left: 5rpx;
  }

  .origin-price-text {
    font-size: 26rpx;
    font-weight: 400;
    text-decoration: line-through;
    color: $gray-c;
    font-family: OPPOSANS;

    &::before {
      content: '￥';
    }
  }
</style>
