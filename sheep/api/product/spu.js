import request from '@/sheep/request';

const SpuApi = {
  // 获得商品 SPU 列表
  getSpuListByIds: (ids) => {
    return request({
      url: `/open/product/category/${ids}`,
      method: 'GET',
      custom: {
        showLoading: false,
        showError: false,
      },
    });
  },
  // 获得商品结算信息
  getSettlementProduct: (spuIds) => {
    return request({
      url: '/open/order/settlement-product',
      method: 'GET',
      params: {
        spuIds,
      },
      custom: {
        showLoading: false,
        showError: false,
      },
    });
  },
  // 获得商品 SPU 分页
  getSpuPage: (params) => {
    return request({
      url: `/open/product/page`,
      method: 'GET',
      params,
      custom: {
        showLoading: false,
        showError: false,
      },
    });
  },
  // 查询商品
  getSpuDetail: (id) => {
    return request({
      url: '/open/product/detail',
      method: 'GET',
      params: {
        id,
      },
      custom: {
        showLoading: false,
        showError: false,
      },
    });
  },
};
export default SpuApi;
