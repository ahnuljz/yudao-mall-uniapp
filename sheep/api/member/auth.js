import request from '@/sheep/request';

const AuthUtil = {
  // 使用手机 + 密码登录
  login: (data) => {
    return request({
      url: '/open/auth/login',
      method: 'POST',
      params: data,
      custom: {
        showSuccess: true,
        loadingMsg: '登录中',
        successMsg: '登录成功',
      },
    });
  },
  // 使用手机 + 验证码登录
  smsLogin: (data) => {
    return request({
      url: '/open/auth/sms-login',
      method: 'POST',
      params: data,
      custom: {
        showSuccess: true,
        loadingMsg: '登录中',
        successMsg: '登录成功',
      },
    });
  },
  // 发送手机验证码
  sendSmsCode: (mobile, scene) => {
    return request({
      url: '/open/auth/send-sms-code',
      method: 'POST',
      params: {
        mobile,
        scene,
      },
      custom: {
        loadingMsg: '发送中',
        showSuccess: true,
        successMsg: '发送成功',
      },
    });
  },
  // 登出系统
  logout: () => {
    return request({
      url: '/open/auth/logout',
      method: 'POST',
    });
  },
  // 社交授权的跳转
  socialAuthRedirect: (type, redirectUri) => {
    return request({
      url: '/open/auth/social-auth-redirect',
      method: 'GET',
      params: {
        type,
        redirectUri,
      },
      custom: {
        showSuccess: true,
        loadingMsg: '登陆中',
      },
    });
  },
  // 社交快捷登录
  socialLogin: (type, code, state) => {
    return request({
      url: '/open/auth/social-login',
      method: 'POST',
      params: {
        type,
        code,
        state,
      },
      custom: {
        showSuccess: true,
        loadingMsg: '登陆中',
      },
    });
  },
  // 微信小程序的一键登录
  weixinMiniAppLogin: (phoneCode, loginCode, state) => {
    return request({
      url: '/open/auth/weixin-mini-app-login',
      method: 'POST',
      params: {
        phoneCode,
        loginCode,
        state,
      },
      custom: {
        showSuccess: true,
        loadingMsg: '登陆中',
        successMsg: '登录成功',
      },
    });
  },
  // 创建微信 JS SDK 初始化所需的签名
  createWeixinMpJsapiSignature: (url) => {
    return request({
      url: '/open/auth/create-weixin-jsapi-signature',
      method: 'POST',
      params: {
        url,
      },
      custom: {
        showError: false,
        showLoading: false,
      },
    });
  },
  //
};

export default AuthUtil;
