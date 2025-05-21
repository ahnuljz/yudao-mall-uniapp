import request from '@/sheep/request';

const DiyApi = {
  getUsedDiyTemplate: () => {
    return request({
      url: '/open/decorate/index',
      method: 'GET',
      custom: {
        showError: true,
        showLoading: true,
      },
    });
  },
  getDiyTemplate: (id) => {
    return request({
      url: `/open/decorate/index`,
      method: 'GET',
      custom: {
        showError: true,
        showLoading: true,
      },
    });
  },
  getDiyPage: (id) => {
    return request({
      url: `/open/decorate/page/${id}`,
      method: 'GET',
    });
  },
};

export default DiyApi;
