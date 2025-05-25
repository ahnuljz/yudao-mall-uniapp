import $store from '@/sheep/store';
import $platform from '@/sheep/platform';
import $router from '@/sheep/router';
import $url from '@/sheep/url';
import BrokerageApi from '@/sheep/api/trade/brokerage';
import { SharePageEnum } from '@/sheep/util/const';

// #ifdef H5
import $wxsdk from '@/sheep/libs/sdk-h5-weixin';
// #endif

// 设置分享的平台渠道: 1=微信小程序,2=AlipayMiniProgram
const platformMap = ['WechatMiniProgram', 'AlipayMiniProgram', 'H5', 'WechatOfficialAccount'];

// 设置分享方式: 1=直接转发,2=海报,3=复制链接,...按需扩展
const fromMap = ['forward', 'poster', 'link'];

// 设置分享信息参数
const getShareInfo = (
  scene = {
    title: '', // 自定义分享标题
    desc: '', // 自定义描述
    image: '', // 自定义分享图片
    params: {}, // 自定义分享参数
  },
  poster = {
    // 自定义海报数据
    type: 'user',
  },
) => {
  const shareInfo = {
    title: '', // 分享标题
    desc: '', // 描述
    image: '', // 分享图片
    path: '', // 分享页面+参数
    link: '', // 分享Url+参数
    query: '', // 分享参数
    poster, // 海报所需数据
    forward: {}, // 转发所需参数
  };
  shareInfo.title = scene.title;
  shareInfo.image = $url.cdn(scene.image);
  shareInfo.desc = scene.desc;

  const app = $store('app');
  const shareConfig = app.platform.share;
  // 自动拼接分享用户参数
  const query = buildSpmQuery(scene.params);
  shareInfo.query = query;
  // 配置分享链接地址
  shareInfo.link = buildSpmLink(query);
  // 配置页面地址带参数
  shareInfo.path = buildSpmPath();
  // 配置页面转发参数
  if (shareConfig.methods.includes('forward')) {
    shareInfo.forward.path = buildSpmPath(query);
  }
  return shareInfo;
};

// 构造 spm 分享参数
// 1）shareId 分享用户的编号；2）page 页面类型；3）query 页面 ID（参数）；4）platform 平台类型；5）from 分享来源类型。
const buildSpmQuery = (params) => {
  const user = $store('user');
  const shareId = user.isLogin ? user.userInfo.customerId : params.shareId || '0'; // 设置分享者用户ID
  const page = params.page || SharePageEnum.HOME.value; // 页面类型，默认首页
  const query = params.query || '0'; // 设置页面ID: 如商品ID、拼团ID等
  const platform = platformMap.indexOf($platform.name) + 1;
  const from = params.from ? platformMap.indexOf(params.from) + 1 : '1';
  return `spm=${shareId}.${page}.${query}.${platform}.${from}`;
};

// 构造页面分享参数: 所有的分享都先到首页进行 spm 参数解析
const buildSpmPath = (query) => {
  return typeof query === 'undefined' ? `pages/index/index` : `pages/index/index?${query}`;
};

// 构造分享链接
const buildSpmLink = (query) => {
  const miniAppid = $store('app').info.appid;
  const linkAddress = import.meta.env.SHOPRO_QR_URL;
  return `${linkAddress}?appid=${miniAppid}&${query}`;
};

// 解析Spm
const decryptSpm = (spm) => {
  let arr = spm.split('.');
  const shareId = arr[0];
  if (shareId !== 0) {
    uni.setStorageSync('shareId', shareId);
  }
  if (arr[1] == SharePageEnum.GOODS.value) {
    $router.go(SharePageEnum.GOODS.page, {
      id: arr[2], // 商品编号
    });
  }

  return {
    spm,
    shareId: arr[0],
    page: arr[1],
    query: arr[2],
    platform: platformMap[arr[3] - 1],
    from: fromMap[arr[4] - 1],
  };
};

// 绑定推广员
const bindBrokerageUser = async (val = undefined) => {
  const shareId = val || uni.getStorageSync('shareId');
  if (!shareId) {
    return;
  }
  const { data } = await BrokerageApi.bindBrokerageUser({ bindUserId: shareId });
  // 绑定成功后清除缓存
  if (data) {
    uni.removeStorageSync('shareId');
  }
};

// 更新公众号分享sdk
const updateShareInfo = (shareInfo) => {
  // #ifdef H5
  if ($platform.name === 'WechatOfficialAccount') {
    $wxsdk.updateShareInfo(shareInfo);
  }
  // #endif
};

export default {
  getShareInfo,
  updateShareInfo,
  decryptSpm,
  bindBrokerageUser,
};
