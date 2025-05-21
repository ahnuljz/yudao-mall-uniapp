<template>
  <s-layout title="填写订单">
    <uni-section title="可选日期" type="line">
      <uni-calendar :insert="true" :lunar="false" :date="selectedDate" :start-date="startDate" :end-date="endDate" :selected="availCalendarList" @change="calendarChange" />
    </uni-section>
    <uni-section title="可选规格" type="line">
      <view class="ss-m-20 ss-flex ss-col-center ss-flex-wrap" v-if="sku.length">
        <view class="ss-flex w-100 border ss-r-20 ss-p-y-10 ss-p-x-20 ss-margin-bottom-20" v-for="s in sku" :key="s.index">
          <view class="w-100"> {{ s.name }} ￥{{ s.marketPrice }} 元/位</view>
          <su-number-box :min="0" :max="s?.stock" :step="1" v-model="s.count" @increase="(n) => increase(n, s)" @decrease="(n) => decrease(n, s)" />
        </view>
        <view class="ss-flex w-100 border ss-r-20 ss-p-y-10 ss-p-x-20 ss-margin-bottom-20">
          <view class="w-100"> 单房 ￥{{ singleSupplements }} 元/位</view>
        </view>
      </view>
      <view v-else class="text-center ss-margin-30"> {{ selectedDate }} 无出团计划</view>
    </uni-section>
    <uni-section title="填写订单" type="line" v-if="form.tourists.length > 0">
      <view class="ss-w-100 ss-font-20 ss-p-l-30">提示：游客1为联系人，如未登陆系统自动创建联系人账号。</view>
      <uni-group :title="`游客${i + 1}. ${tt.skuName}`" mode="card" v-for="(tt, i) in form.tourists" :key="i">
        <view class="uni-form-item uni-column ss-flex ss-p-10 ss-m-t-30">
          <view style="width: 66px; text-align: right">证 件：</view>
          <uni-easyinput
            style="border-bottom: 1px solid lightgray; width: 100%"
            type="idcard"
            v-model="tt.idNumber"
            :inputBorder="false"
            :clearable="true"
            :placeholder="i == 0 ? `联系人身份证号` : `身份证号`"
          />
          <view class="ss-font-30" style="color: red; width: 30px">*</view>
        </view>
        <view class="uni-form-item uni-column ss-flex ss-p-10">
          <view style="width: 66px; text-align: right">姓 名：</view>
          <uni-easyinput
            style="border-bottom: 1px solid lightgray; width: 100%"
            type="text"
            v-model="tt.name"
            :inputBorder="false"
            :clearable="true"
            :placeholder="i == 0 ? `联系人姓名` : `姓名`"
          />
          <view class="ss-font-30" style="color: red; width: 30px">*</view>
        </view>
        <view class="uni-form-item uni-column ss-flex ss-p-10" v-if="i == 0">
          <view style="width: 66px; text-align: right">电 话：</view>
          <uni-easyinput
            style="border-bottom: 1px solid lightgray; width: 100%"
            type="number"
            v-model="tt.phone"
            :inputBorder="false"
            :clearable="true"
            :placeholder="i == 0 ? `联系人电话` : `联系电话`"
          />
          <view class="ss-font-30" style="color: red; width: 30px">*</view>
        </view>
        <view class="uni-form-item uni-column ss-flex ss-p-10 ss-m-y-20">
          <view style="width: 66px; text-align: right">单 房：</view>
          <uni-data-checkbox
            style="width: 100%"
            v-model="tt.isSingle"
            :localdata="[
              { value: 1, text: '独享房间' },
              { value: 0, text: '共享房间' },
            ]"
          />
          <view class="ss-font-30" style="color: red; width: 30px">*</view>
        </view>
      </uni-group>
    </uni-section>

    <view class="total-box-footer ss-font-28 ss-flex ss-row-right ss-col-center ss-m-r-28">
      <view class="total-num ss-m-r-20"> 共{{ form.tourists.length }}人</view>
      <view>合计：</view>
      <view class="total-num text-red"> ￥{{ fen2yuan(ammount) }}</view>
    </view>

    <!-- 底部 -->
    <su-fixed bottom :opacity="false" bg="bg-white" placeholder :noFixed="false" :index="200">
      <view class="footer-box border-top ss-flex ss-row-between ss-p-x-20 ss-col-center">
        <view class="total-box-footer ss-flex ss-col-center">
          <view class="total-num ss-font-30 text-red"> ￥{{ fen2yuan(ammount) }}</view>
        </view>
        <button class="ss-reset-button ui-BG-Main-Gradient ss-r-40 submit-btn ui-Shadow-Main" @tap="submit" v-if="form.tourists.length > 0">提交订单</button>
      </view>
    </su-fixed>
  </s-layout>
</template>

<script setup>
import { computed, ref, nextTick, reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import sheep from '@/sheep';
import OrderApi from '@/sheep/api/trade/order';
import { fen2yuan } from '@/sheep/hooks/useGoods';
import UniCalendar from '@/uni_modules/uni-calendar/components/uni-calendar/uni-calendar.vue';
import { tourist_init, validateTourists } from './init.js';
import { cloneDeep, findLastIndex } from 'lodash-es';
import { getAnalysisIdCard } from '@/sheep/util/Idcard.js';

const form = reactive({
  // 必要参数
  pid: 0,
  planId: void 0,
  serviceOnly: 0,
  proxy: 0,
  staffId: 0,
  orderAmount: 0,

  skus: [],
  tourists: [],
  addition: [],
});
const selectedDate = ref('');
const startDate = ref('');
const endDate = ref('');
const singleSupplements = ref(0);
const plans = ref([]);
const sku = ref([]);
// 费用计算
const ammount = computed(() => {
  return sku.value.map((e) => e.count * e.marketPrice).reduce((a, b) => a + b, 0) + form.tourists.map((e) => (e.isSingle ? singleSupplements.value : 0)).reduce((a, b) => a + b, 0);
});
// 日历范围数据
const availCalendarList = computed(() => {
  return plans.value.map((e) => {
    return {
      date: e.startDate,
      info: '￥' + Math.min(...e.skus.map((f) => f.marketPrice)),
      data: {
        planId: e.id,
      },
    };
  });
});

// 初始化
const load = (planId) => {
  form.tourists = [];
  form.orderAmount = 0;
  form.planId = planId;
  const arr = plans.value.filter((e) => e.id == planId);
  if (arr.length == 1)
    sku.value = arr[0].skus.map((f) => ({
      ...f,
      count: 0,
    }));
};
const calendarChange = (d) => {
  sku.value = d.extraInfo?.data ?? [];
  selectedDate.value = d.fulldate;
  load(d.extraInfo?.data.planId);
};
// 提交信息
const stringData = () => {
  const phone = form.tourists[0].phone;
  return {
    ...form,
    tourists: form.tourists.map((e, index) => ({
      ...e,
      idType: 1,
      gender: getAnalysisIdCard(e.idNumber, 'sex'),
      age: getAnalysisIdCard(e.idNumber, 'age'),
      birthday: getAnalysisIdCard(e.idNumber, 'birthDate'),
      bus: 1,
      seat: 0,
      singleSupplements: e.isSingle ? singleSupplements.value : 0,
      isSigner: index == 0 ? 1 : 0,
      phone: phone,
    })),
    skus: sku.value,
    orderAmount: ammount.value,
    customerId: sheep.$store('user').userInfo.customerId,
  };
};

// 游客数量变化
const increase = (count, sku) => {
  nextTick(() => add(sku.index, sku.name, sku.marketPrice, 1), 10);
};
const decrease = (count, sku) => {
  nextTick(() => remove(sku.index, sku.name, sku.marketPrice, 1), 10);
};
const add = (sku, skuName, cost, count) => {
  for (let i = 0; i < count; i++) {
    form.tourists.push({ ...cloneDeep(tourist_init), sku, skuName, cost, t: new Date().getTime() });
  }
  const mySort = (a, b) => {
    if (a.sku !== b.sku) return a.sku < b.sku ? -1 : 1;
    else if (a.t !== b.t) return a.t < b.t ? -1 : 1;
  };
  form.tourists = form.tourists.sort(mySort);
};
const remove = (sku, skuName, cost, count) => {
  const pos = findLastIndex(form.tourists, (e) => e.sku === sku && e.skuName === skuName);
  form.tourists.splice(pos - count + 1, count);
};

const submit = () => {
  const valid = validateTourists(ammount.value, form.tourists, sku.value);
  if (valid) {
    OrderApi.createOrder(stringData()).then((ds) => {
      if (ds.code !== 0) {
        sheep.$helper.toast(ds.message, 3900);
        return;
      }
      sheep.$helper.toast('提交成功');
      uni.redirectTo({
        url: '/pages/pay/index?id=' + ds.data.orderId + '&orderType=goods',
      });
    });
  }
};

onLoad(async (options) => {
  // 解析参数
  if (!options.data) {
    sheep.$helper.toast('参数不正确，请检查！');
    return;
  }
  const data = JSON.parse(options.data);
  plans.value = data.plans;
  singleSupplements.value = data.singleSupplements;

  nextTick(() => {
    const arr = availCalendarList.value;
    if (arr && arr.length) {
      load(arr[0].data.planId);
      selectedDate.value = arr[0].date;
      startDate.value = arr[0].date;
      endDate.value = arr[arr.length - 1].date;
    }
  });
});
</script>

<style lang="scss" scoped>
.total-box-footer {
  height: 90rpx;

  .total-num {
    color: #333333;
    font-family: OPPOSANS;
  }
}

.footer-box {
  height: 100rpx;

  .submit-btn {
    width: 240rpx;
    height: 70rpx;
    font-size: 28rpx;
    font-weight: 500;

    .goto-pay-text {
      line-height: 28rpx;
    }
  }

  .cancel-btn {
    width: 240rpx;
    height: 80rpx;
    font-size: 26rpx;
    background-color: #e5e5e5;
    color: $dark-9;
  }
}

:deep(.uni-group__content) {
  padding: 0 !important;
}

:deep(.uni-card__content) {
  padding: 15px 0 !important;
}
</style>
