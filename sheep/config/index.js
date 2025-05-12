// 开发环境配置
export let baseUrl;
export let version;
if (process.env.NODE_ENV === 'development') {
  baseUrl = import.meta.env.SHOPRO_DEV_BASE_URL;
} else {
  baseUrl = import.meta.env.SHOPRO_BASE_URL;
}
version = import.meta.env.SHOPRO_VERSION;
console.log(`[旅小助商城 ${version}]  http://mall.yebenkj.com`);

export const apiPath = import.meta.env.SHOPRO_API_PATH;
export const staticUrl = import.meta.env.SHOPRO_STATIC_URL;
export const tenantId = import.meta.env.SHOPRO_TENANT_ID;
export const db = import.meta.env.SHOPRO_DATASET;
export const websocketPath = import.meta.env.SHOPRO_WEBSOCKET_PATH;

export default {
  baseUrl,
  apiPath,
  staticUrl,
  tenantId,
  websocketPath,
};
