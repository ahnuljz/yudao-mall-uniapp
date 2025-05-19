import sheep from '@/sheep';
import verifyCardNum from './idcheck.js';

export const tourist_init = {
  id: void 0,
  name: '',
  gender: '',
  phone: '',
  idType: '身份证',
  idNumber: '',
  age: void 0,
  isChild: 0,
  nationality: '中国',
  race: '汉族',
  health: '良好',
  address: '无',
  isSingle: 0,
  singleSupplements: 0,
  sku: void 0,
  skuName: void 0,
  cost: void 0,
  isSigner: 0,
  remarks: '',
};

// 手机号码校验函数
export const isPhone = (phone) => {
  return /^((13[0-9])|(14[1|4|5|6|7|8|9])|(15([0|1|2|3|5|6|7|8|9]))|(16[2|5|6|7])|(17[0|1|2|3|5|6|7|8])|(18[0-9])|(19[1|8|9]))\d{8}$/.test(phone);
};

// 正则表达式，匹配中文字符
export const isValidName = (name) => {
  const nameRegex = /^[\u4e00-\u9fa5]+$/;
  return nameRegex.test(name);
};

// 校验游客信息
export const validateTourists = (ammount, list, sku) => {
  if (ammount < 0.01) {
    sheep.$helper.toast(`订单价格必须大于0`);
    return false;
  }
  if (list.length <= 0) {
    sheep.$helper.toast(`订单信息不完整`);
    return false;
  }

  const errs = [];
  list.forEach((e, i) => {
    if (!e.name) {
      errs.push(`游客${i + 1} 姓名不能为空`);
    } else {
      if (!isValidName(e.name)) {
        errs.push(`游客${i + 1} 姓名 ${e.name} 格式不正确`);
      }
    }
    if (!e.idNumber) {
      errs.push(`游客${i + 1} 身份证号不能为空`);
    } else {
      if (!verifyCardNum(e.idNumber)) {
        errs.push(`游客${i + 1} 身份证号 ${e.idNumber} 格式不正确`);
      }
    }
    if (i == 0 && !isPhone(e.phone)) {
      errs.push(`游客${i + 1} 手机号 ${e.phone} 格式不正确`);
    }
  });
  if (errs.length > 0) {
    sheep.$helper.toast(errs.join('\n'));
    return false;
  }

  const count = sku.map((e) => e.count).reduce((a, b) => a + b, 0);
  const n1 = [...new Set(list.map((e) => e.idNumber))].length;
  if (n1 != count) {
    sheep.$helper.toast(`身份证号码不能重复`);
    return false;
  }
  return true;
};
