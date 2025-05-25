<template>
  <view v-if="done">
    <text>签名已完成</text>
    <a :href="pdflink" target="_blank">下载合同pdf</a>
  </view>
  <view v-else>
    <scroll-view style="height: calc(100vh - 40px)" scroll-y="true">
      <div id="demo" style="height: 100%"></div>
    </scroll-view>
    <view style="height: 40px; width: 100%; overflow: hidden" class="ss-flex ss-flex-row">
      <button type="primary" @click="handleGoSign" class="ss-flex-1">去签名</button>
      <button type="warn" @click="handleComplete" class="ss-flex-1">完成</button>
    </view>
  </view>
</template>

<script setup>
import Pdfh5 from 'pdfh5';
import 'pdfh5/css/pdfh5.css';
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { staticUrl } from '@/sheep/config';
import OrderApi from '@/sheep/api/trade/order';

const customerId = ref(0);
const done = ref(false);
const pdflink = ref('');
const pdfh5DOM = ref();

onLoad((option) => {
  uni.setStorageSync('signature', '');
  const id = option.id;
  const dd = option.done;
  if (!id) return;
  customerId.value = id;
  done.value = !!dd;
  const pdf = `${staticUrl}/pdf/${id}.pdf`;
  pdflink.value = pdf;
  fetch(pdf, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/pdf',
    },
  })
    .then((r) => r.arrayBuffer())
    .then((blob) => {
      pdfh5DOM.value = new Pdfh5(document.querySelector('#demo'), {
        data: blob,
        cMapUrl: 'https://unpkg.com/pdfjs-dist@2.0.943/cmaps/',
        logo: { src: '/static/32px.png', x: 0, y: 5, width: 32, height: 32 },
      });
    })
    .catch((error) => console.log(error));
});

const handleGoSign = () => {
  uni.navigateTo({ url: `/pages/order/sign/sgin` });
};

const handleComplete = async () => {
  const signature = uni.getStorageSync('signature');
  if (!signature) {
    uni.showToast({
      title: '请完成签名哦',
    });
    return;
  }
  OrderApi.step2({ id: customerId.value, signature }).then(() => {
    uni.showToast({
      title: '签名提交成功',
    });
  });
};
</script>
