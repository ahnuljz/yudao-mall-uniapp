import DiyApi from '@/sheep/api/promotion/diy';
import { defineStore } from 'pinia';
import $platform from '@/sheep/platform';
import $router from '@/sheep/router';
import user from './user';
import sys from './sys';
import { staticUrl } from '@/sheep/config';
import sheep from '@/sheep';

const app = defineStore({
  id: 'app',
  state: () => ({
    info: {
      // 应用信息
      name: '', // 商城名称
      logo: '', // logo
      version: '', // 版本号
      copyright: '', // 版权信息 I
      copytime: '', // 版权信息 II

      cdnurl: '', // 云存储域名
      filesystem: '', // 云存储平台
    },
    platform: {
      share: {
        methods: [], // 支持的分享方式
        forwardInfo: {}, // 默认转发信息
        posterInfo: {}, // 海报信息
        linkAddress: '', // 复制链接地址
      },
      bind_mobile: 0, // 登陆后绑定手机号提醒 (弱提醒，可手动关闭)
    },
    template: {
      // 店铺装修模板
      basic: {}, // 基本信息
      home: {
        // 首页模板
        style: {},
        data: [],
      },
      user: {
        // 个人中心模板
        style: {},
        data: [],
      },
    },
    shareInfo: {}, // 全局分享信息
    has_wechat_trade_managed: 0, // 小程序发货信息管理  0 没有 || 1 有
  }),
  actions: {
    // 获取Shopro应用配置和模板
    async init(templateId = null) {
      // 检查网络
      const networkStatus = await $platform.checkNetwork();
      if (!networkStatus) {
        $router.error('NetworkError');
      }

      // 加载装修配置
      await adaptTemplate(this.template, templateId);

      // TODO 支持管理后台可配
      if (true) {
        this.info = {
          name: '旅小助商城',
          logo: sheep.$url.cdn('/img/128px.png'),
          version: '2.4.0',
          copyright: '值得信赖的商城，旅小助商城',
          copytime: 'Copyright© 2020-2025',
          cdnurl: staticUrl, // 云存储域名
          filesystem: 'qiniu', // 云存储平台
        };
        this.platform = {
          share: {
            methods: ['forward', 'poster', 'link'],
            linkAddress: import.meta.env.SHOPRO_QR_URL,
            posterInfo: {
              user_bg: sheep.$url.cdn('/img/user-poster-bg.png'),
              goods_bg: sheep.$url.cdn('/img/goods-poster-bg.png'),
              groupon_bg: sheep.$url.cdn('/img/groupon-poster-bg.png'),
            },
            forwardInfo: {
              title: '',
              image: '',
              desc: '',
            },
          },
          bind_mobile: 0,
        };
        this.has_wechat_trade_managed = 0;

        // 加载主题
        const sysStore = sys();
        sysStore.setTheme();

        // 模拟用户登录
        const userStore = user();
        if (userStore.isLogin) {
          userStore.loginAfter();
        }
        return Promise.resolve(true);
      } else {
        $router.error('InitError', res.message || '加载失败');
      }
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'app-store',
      },
    ],
  },
});

// todo: @owen 先做数据适配，后期重构
const adaptTemplate = async (appTemplate, templateId) => {
  const { data: diyTemplate } = templateId
    ? // 查询指定模板，一般是预览时使用
      await DiyApi.getDiyTemplate(templateId)
    : await DiyApi.getUsedDiyTemplate();
  // 模板不存在
  if (!diyTemplate) {
    $router.error('TemplateError');
    return;
  }

  const tabBar = diyTemplate?.basic;
  if (tabBar) {
    appTemplate.basic.tabbar = tabBar;
    // TODO 商城装修没有对 tabBar 进行角标配置，测试角标需打开以下注释
    // appTemplate.basic.tabbar.items.forEach((tabBar) => {
    //   tabBar.dot = false
    //   tabBar.badge = 100
    // })
    // appTemplate.basic.tabbar.badgeStyle = {
    //   backgroundColor: '#882222',
    // }
    if (tabBar?.theme) {
      appTemplate.basic.theme = tabBar?.theme;
    }
  }
  appTemplate.home = diyTemplate?.home;
  appTemplate.user = diyTemplate?.user;
};

export default app;
