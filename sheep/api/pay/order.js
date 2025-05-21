import request from '@/sheep/request';

const PayOrderApi = {
  // 获得支付订单
  getOrder: (id, sync) => {
    return request({
      url: `/trade/order/pay/data/${id}`,
      method: 'GET',
      params: { id, sync },
    });
  },
  // 提交支付订单
  submitOrder: (data) => {
    return request({
      url: '/trade/order/pay/submit',
      method: 'POST',
      params: data,
    });
  },
};

export default PayOrderApi;
