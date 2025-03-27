import request from '@/sheep/request';

const DiyApi = {
  getUsedDiyTemplate: () => {
    return request({
      url: '/template/json/used',
      method: 'GET',
      custom: {
        showError: false,
        showLoading: false,
      },
    });
  },
  getDiyTemplate: (id) => {
    return request({
      url: `/template/json/${id}`,
      method: 'GET',
      custom: {
        showError: false,
        showLoading: false,
      },
    });
  },
  getDiyPage: (id) => {
    return request({
      url: `/page/json/${id}`,
      method: 'GET'
    });
  },
};

export default DiyApi;
