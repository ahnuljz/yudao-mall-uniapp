<template>
  <view class="bg-white ss-flex-col ss-m-y-20">
    <uni-group title="规格" style="padding: 0">
      <uni-section title="可选日期" type="line">
        <uni-calendar :insert="true" :lunar="false" :date="selectedDate" :start-date="startDate" :end-date="endDate" :selected="availCalendarList" @change="calendarChange" />
      </uni-section>
      <uni-section title="可选规格" type="line">
        <uni-list v-if="sku.length">
          <uni-list-item
            v-for="s in sku"
            :show-extra-icon="true"
            :extra-icon="{
              color: '#00e',
              size: '22',
              type: 'person',
            }"
          >
            <template v-slot:body>
              <view class="ss-flex ss-flex-col">
                <text class="slot-box slot-text">{{ s.name }} ￥{{ s.marketPrice }}</text>
                <text style="color: #999; font-size: 12px; margin-left: 6px; line-height: 20px">元/位</text>
              </view>
            </template>
            <template v-slot:footer>
              <text class="slot-box slot-text" style="padding-left: 20px">剩余 {{ s.stock - s.sale }}</text>
            </template>
          </uni-list-item>
          <uni-list-item
            :show-extra-icon="true"
            :extra-icon="{
              color: '#d00',
              size: '22',
              type: 'vip',
            }"
          >
            <template v-slot:body>
              <view class="ss-flex ss-flex-col">
                <text class="slot-box slot-text">单房 ￥{{ singleSupplements }}</text>
                <text style="color: #999; font-size: 12px; margin-left: 6px; line-height: 20px">元/位</text>
              </view>
            </template>
            <template v-slot:footer>
              <text class="slot-box slot-text" style="padding-left: 20px">单独房间补差价</text>
            </template>
          </uni-list-item>
        </uni-list>
        <view v-else class="text-center ss-margin-30"> {{ selectedDate }} 无出团计划</view>
      </uni-section>
    </uni-group>
  </view>
</template>

<script setup>
import { computed, ref, onMounted, nextTick } from 'vue';
import UniCalendar from '@/uni_modules/uni-calendar/components/uni-calendar/uni-calendar.vue';

const props = defineProps({
  plans: Array | undefined,
  singleSupplements: Number,
});
const planId = ref(0);
const selectedDate = ref('');
const startDate = ref('');
const endDate = ref('');
const sku = ref([]);
// 日历范围数据
const availCalendarList = computed(() => {
  return props.plans.map((e) => {
    return {
      date: e.startDate,
      info: '￥' + Math.min(...e.skus.map((f) => f.marketPrice)),
      data: {
        planId: e.id,
      },
    };
  });
});
const load = (p) => {
  planId.value = p;
  const arr = props.plans.filter((e) => e.id == p);
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
onMounted(() => {
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

<style scoped lang="scss">
:deep(.uni-group__content) {
  padding: 0 !important;
}

:deep(.uni-card__content) {
  padding: 15px 0 !important;
}

.slot-box {
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: row;
  align-items: center;
}

.slot-image {
  /* #ifndef APP-NVUE */
  display: block;
  /* #endif */
  margin-right: 10px;
  width: 30px;
  height: 30px;
}

.slot-text {
  font-size: 14px;
  color: #444;
  font-weight: 600;
  line-height: 20px;
}
</style>
