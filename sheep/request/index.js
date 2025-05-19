/**
 * Shopro-request
 * @description api模块管理，loading配置，请求拦截，错误处理
 */

import Request from 'luch-request';
import { apiPath, baseUrl, db, tenantId, appid, storeId } from '@/sheep/config';
import $store from '@/sheep/store';
import { showAuthModal } from '@/sheep/hooks/useModal';

const options = {
  // 显示操作成功消息 默认不显示
  showSuccess: false,
  // 成功提醒 默认使用后端返回值
  successMsg: '',
  // 显示失败消息 默认显示
  showError: true,
  // 失败提醒 默认使用后端返回信息
  errorMsg: '',
  // 显示请求时loading模态框 默认显示
  showLoading: true,
  // loading提醒文字
  loadingMsg: '加载中',
  // 需要授权才能请求 默认放开
  auth: false,
  // ...
};

// Loading全局实例
let LoadingInstance = {
  target: null,
  count: 0,
};

/**
 * 关闭loading
 */
function closeLoading() {
  if (LoadingInstance.count > 0) LoadingInstance.count--;
  if (LoadingInstance.count === 0) uni.hideLoading();
}

/**
 * @description 请求基础配置 可直接使用访问自定义请求
 */
const http = new Request({
  baseURL: baseUrl + apiPath,
  timeout: 8000,
  method: 'GET',
  header: {
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=UTF-8',
    platform: uni.getSystemInfoSync().uniPlatform,
  },
  // #ifdef APP-PLUS
  sslVerify: false,
  // #endif
  // #ifdef H5
  // 跨域请求时是否携带凭证（cookies）仅H5支持（HBuilderX 2.6.15+）
  withCredentials: false,
  // #endif
  custom: options,
});

/**
 * @description 请求拦截器
 */
http.interceptors.request.use(
  (config) => {
    // 自定义处理【auth 授权】：必须登录的接口，则跳出 AuthModal 登录弹窗
    if (config.custom.auth && !$store('user').isLogin) {
      showAuthModal();
      return Promise.reject();
    }

    // 自定义处理【loading 加载中】：如果需要显示 loading，则显示 loading
    if (config.custom.showLoading) {
      LoadingInstance.count++;
      LoadingInstance.count === 1 &&
        uni.showLoading({
          title: config.custom.loadingMsg,
          mask: true,
          fail: () => {
            uni.hideLoading();
          },
        });
    }

    // 增加 token 令牌、tenant 租户的请求头
    const token = uni.getStorageSync('token');
    if (token) {
      config.header['authorization'] = token;
    }
    config.header['Accept'] = '*/*';
    config.header['biz'] = tenantId; // 商家
    config.header['appid'] = appid; // 微信小程序
    config.header['ref'] = getReferralInfo(); // 推荐人
    config.header['db'] = db;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * @description 响应拦截器
 */
http.interceptors.response.use(
  (response) => {
    // 约定：如果是 /auth/ 下的 URL 地址，并且返回了 token 说明是登录相关的接口，则自动设置登陆令牌
    if (response.config.url.indexOf('/member/auth/') >= 0 && response.data?.data?.token) {
      $store('user').setToken(response.data.data.token);
    }

    // 自定处理【loading 加载中】：如果需要显示 loading，则关闭 loading
    response.config.custom.showLoading && closeLoading();

    // 自定义处理【error 错误提示】：如果需要显示错误提示，则显示错误提示
    if (response.data.code !== 0) {
      // 特殊：处理分销用户绑定失败的提示
      if ((response.data.code + '').includes('1011007')) {
        console.error(`分销用户绑定失败，原因：${response.data.message}`);
      } else if (response.config.custom.showError) {
        // 错误提示
        uni.showToast({
          title: response.data.message || '服务器开小差啦,请稍后再试~',
          icon: 'none',
          mask: true,
        });
      }
    }

    // 自定义处理【showSuccess 成功提示】：如果需要显示成功提示，则显示成功提示
    if (response.config.custom.showSuccess && response.config.custom.successMsg !== '' && response.data.code === 0) {
      uni.showToast({
        title: response.config.custom.successMsg,
        icon: 'none',
      });
    }

    // 返回结果：包括 code + data + msg
    return Promise.resolve(response.data);
  },
  (error) => {
    let errorMessage = '网络请求出错';
    if (error !== undefined) {
      if (error.errMsg.includes('timeout')) errorMessage = '请求超时';
      // #ifdef H5
      if (error.errMsg.includes('Network')) errorMessage = window.navigator.onLine ? '服务器异常' : '请检查您的网络连接';
      // #endif
    }

    if (error && error.config) {
      if (error.config.custom.showError === false) {
        uni.showToast({
          title: error.data?.message || errorMessage,
          icon: 'none',
          mask: true,
        });
      }
      error.config.custom.showLoading && closeLoading();
    }

    return false;
  },
);

/** 获得推荐人信息：1storeId/2staffId/3customerId */
export const getReferralInfo = () => {
  const refId = uni.getStorageSync('ref');
  const defaultRef = '1' + storeId;
  console.log(refId || defaultRef);
  return refId || defaultRef;
};

const request = (config) => {
  return http.middleware(config);
};

export default request;
