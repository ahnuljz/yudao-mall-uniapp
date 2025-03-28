import request from '@/sheep/request';

const DiyApi = {
  getUsedDiyTemplate: () => {
    return request({
      url: '/template/json/used',
      method: 'GET',
      custom: {
        showError: true,
        showLoading: true,
      },
    });
  },
  getDiyTemplate: (id) => {
    return request({
      url: `/template/json/${id}`,
      method: 'GET',
      custom: {
        showError: true,
        showLoading: true,
      },
    });
  },
  getDiyPage: (id) => {
    return request({
      url: `/page/json/${id}`,
      method: 'GET',
    });
  },
};

export default DiyApi;
