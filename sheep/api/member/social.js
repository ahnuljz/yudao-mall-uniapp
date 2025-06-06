import request from '@/sheep/request';

const SocialApi = {
  // 获得社交用户
  getSocialUser: (type) => {
    return request({
      url: '/member/social-user/get',
      method: 'GET',
      params: {
        type,
      },
      custom: {
        showLoading: false,
      },
    });
  },
  // 社交绑定
  socialBind: (type, code, state) => {
    return request({
      url: '/member/social-user/bind',
      method: 'POST',
      params: {
        type,
        code,
      },
      custom: {
        custom: {
          showSuccess: true,
          loadingMsg: '绑定中',
          successMsg: '绑定成功',
        },
      },
    });
  },
  // 社交绑定
  socialUnbind: (type, openid) => {
    return request({
      url: '/member/social-user/unbind',
      method: 'DELETE',
      params: {
        type,
        openid,
      },
      custom: {
        showLoading: false,
        loadingMsg: '解除绑定',
        successMsg: '解绑成功',
      },
    });
  },
  // 获取订阅消息模板列表
  getSubscribeTemplateList: () =>
    request({
      url: '/member/social-user/get-subscribe-template-list',
      method: 'GET',
      custom: {
        showError: false,
        showLoading: false,
      },
    }),
  // 获取微信小程序码
  getWxaQrcode: async (path, query) => {
    return await request({
      url: '/member/social-user/wxa-qrcode',
      method: 'POST',
      params: { path, query },
    });
  },
};

export default SocialApi;
