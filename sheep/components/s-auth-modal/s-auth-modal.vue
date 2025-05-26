<template>
  <!-- 规格弹窗 -->
  <su-popup :show="authType !== ''" round="10" :showClose="true" @close="closeAuthModal" @change="onOpen">
    <view class="login-wrap">
      <!-- 1. 账号密码登录 accountLogin -->
      <account-login v-if="authType === 'accountLogin'" />

      <!-- 2. 短信登录  smsLogin -->
      <sms-login v-if="authType === 'smsLogin'" />

      <!-- 3. 忘记密码 resetPassword-->
      <reset-password v-if="authType === 'resetPassword'" />

      <!-- 4. 绑定手机号 changeMobile -->
      <change-mobile v-if="authType === 'changeMobile'" />

      <!-- 5. 修改密码 changePassword-->
      <changePassword v-if="authType === 'changePassword'" />

      <!-- 6. 微信小程序授权 -->
      <mp-authorization v-if="authType === 'mpAuthorization'" />

      <!-- 7. 第三方登录 -->
      <view class="auto-login-box ss-flex ss-flex-col ss-row-center ss-col-center">
        <!-- #ifdef MP -->
        <view class="ss-flex register-box">
          <button class="ss-reset-button login-btn-start w-50" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">手机号一键登录</button>
        </view>
        <!-- #endif -->

        <!-- #ifdef MP-WEIXIN -->
        <button v-if="!isAuthrized" @getuserinfo="showAuthModal('mpAuthorization')" open-type="getUserInfo" class="ss-reset-button login-btn-start w-50">xxx</button>
        <!-- #endif -->
        <!-- #ifdef MP-ALIPAY -->
        <button v-if="!isAuthrized" @getuserinfo="showAuthModal('mpAuthorization')" open-type="getAuthorize" class="ss-reset-button login-btn-start w-50">xxx</button>
        <!-- #endif -->
      </view>
      <view class="safe-box" />
    </view>
  </su-popup>
</template>

<script setup>
import { computed, ref } from 'vue';
import sheep from '@/sheep';
import accountLogin from './components/account-login.vue';
import smsLogin from './components/sms-login.vue';
import resetPassword from './components/reset-password.vue';
import changeMobile from './components/change-mobile.vue';
import changePassword from './components/change-password.vue';
import mpAuthorization from './components/mp-authorization.vue';
import { closeAuthModal, showAuthModal } from '@/sheep/hooks/useModal';

const modalStore = sheep.$store('modal');
const authType = computed(() => modalStore.auth);

const isLogin = computed(() => sheep.$store('user').isLogin);
const isAuthrized = ref(false);
// 第三方授权登陆
const onOpen = async () => {
  if (isLogin) return;
  const provider = sheep.$platform.provider;
  const loginRes = await sheep.$platform.useProvider(provider).login();
  if (loginRes) {
    const userInfo = await sheep.$store('user').getInfo();
    closeAuthModal();
    if (userInfo.avatar && userInfo.nickname) {
      return;
    }
    isAuthrized.value = true;
  }
};

// 微信小程序的“手机号快速验证”：https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/getPhoneNumber.html
const getPhoneNumber = async (e) => {
  if (e.detail.errMsg !== 'getPhoneNumber:ok') {
    sheep.$helper.toast('快捷登录失败');
    return;
  }
  let result = await sheep.$platform.useProvider().mobileLogin(e.detail);
  if (result) {
    closeAuthModal();
  }
};
</script>

<style lang="scss" scoped>
@import './index.scss';

.bt {
  width: 358rpx;
  height: 56rpx;
  line-height: normal;
  border-radius: 28rpx;
  font-size: 26rpx;
  font-weight: 500;
  color: #fff;
}

.wx {
  background-color: limegreen;
}

.w-50 {
  width: 358rpx;
}

.al {
  background-color: dodgerblue;
}

.shake {
  animation: shake 0.05s linear 4 alternate;
}

@keyframes shake {
  from {
    transform: translateX(-10rpx);
  }
  to {
    transform: translateX(10rpx);
  }
}

.register-box {
  position: relative;
  justify-content: center;

  .register-btn {
    color: #999999;
    font-size: 30rpx;
    font-weight: 500;
  }

  .register-title {
    color: #999999;
    font-size: 30rpx;
    font-weight: 400;
    margin-right: 24rpx;
  }

  .or-title {
    margin: 0 16rpx;
    color: #999999;
    font-size: 30rpx;
    font-weight: 400;
  }

  .login-btn {
    color: var(--ui-BG-Main);
    font-size: 30rpx;
    font-weight: 500;
  }
}

.safe-box {
  height: calc(constant(safe-area-inset-bottom) / 5 * 3);
  height: calc(env(safe-area-inset-bottom) / 5 * 3);
}

.tcp-text {
  color: var(--ui-BG-Main);
}

.agreement-text {
  color: $dark-9;
}
</style>
