<template>
  <view class="page">
    <view class="wrapper">
      <view class="handBtn">
        <button @click="retDraw" class="delBtn">重写</button>
        <button @click="previewCanvasImg" class="previewBtn">预览</button>
        <button @click="subCanvas" class="subBtn">完成</button>
      </view>
      <view class="handCenter">
        <view class="name-box">
          <text class="rotate90" v-for="(n, i) in name" :key="i">{{ n }}</text>
        </view>
        <canvas class="handWriting" :disable-scroll="true" @touchstart="uploadScaleStart" @touchmove="uploadScaleMove" @touchend="uploadScaleEnd" canvas-id="handWriting"></canvas>
      </view>
      <view class="handRight">
        <view class="icon-box" @click="back">
          <image class="icon" :src="sheep.$url.cdn('/img/back.png')" mode="heightFix" />
        </view>
        <view class="handTitle">请签名</view>
      </view>
      <canvas :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }" style="position: absolute; left: -1000rpx" canvas-id="rotatedCanvas"></canvas>
    </view>
  </view>
</template>

<script setup>
import { onReady } from '@dcloudio/uni-app';
import { ref } from 'vue';
import sheep from '@/sheep';

const name = ref();
const canvasName = ref('handWriting');
const ctx = ref('');
const canvasWidth = ref(0);
const canvasHeight = ref(0);
const transparent = ref(1);
const selectColor = ref('black');
const lineColor = ref('#1A1A1A'); // 颜色
const lineSize = ref(1.5); // 笔记倍数
const lineMin = ref(0.5); // 最小笔画半径
const lineMax = ref(4); // 最大笔画半径
const pressure = ref(1); // 默认压力
const smoothness = ref(60); //顺滑度，用60的距离来计算速度
const currentPoint = ref({});
const currentLine = ref([]); // 当前线条
const firstTouch = ref(true); // 第一次触发
const radius = ref(1); //画圆的半径
const cutArea = ref({
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
}); //裁剪区域
const bethelPoint = ref([]); //保存所有线条 生成的贝塞尔点；
const lastPoint = ref(0);
const chirography = ref([]); //笔迹
const currentChirography = ref({}); //当前笔迹
const linePrack = ref([]); //划线轨迹 , 生成线条的实际点
const flag = ref(false); //非空判断
const contract = ref(false);
onReady(() => {
  let canvasNames = canvasName.value;
  let ctxs = uni.createCanvasContext(canvasNames);
  ctx.value = ctxs;
  var query = uni.createSelectorQuery();
  query
    .select('.handCenter')
    .boundingClientRect((rect) => {
      canvasWidth.value = rect.width;
      canvasHeight.value = rect.height;
      /* 将canvas背景设置为 白底，不设置  导出的canvas的背景为透明 */
      setCanvasBg('#fff');
    })
    .exec();
});
//设置canvas背景色  不设置  导出的canvas的背景为透明
//@params：字符串  color
const setCanvasBg = (color) => {
  ctx.value?.rect(0, 0, canvasWidth.value, canvasHeight.value - 4);
  // ctx.setFillStyle('red')color
  ctx.value?.setFillStyle('rgba(0, 0, 0, 0)');
  ctx.value?.fill(); //设置填充
  ctx.value?.draw(); //开画
};

// canvas
// 笔迹开始
const uploadScaleStart = (e) => {
  if (e.type != 'touchstart') return false;
  flag.value = true;
  let ctxs = ctx.value;
  ctxs.setFillStyle(lineColor.value); // 初始线条设置颜色
  ctxs.setGlobalAlpha(transparent.value); // 设置半透明
  let currentPoints = {
    x: e.touches[0].x,
    y: e.touches[0].y,
  };
  let currentLines = currentLine.value;
  currentLines.unshift({
    time: new Date().getTime(),
    dis: 0,
    x: currentPoint.x,
    y: currentPoint.y,
  });
  currentPoint.value = currentPoints;
  // currentLines
  if (firstTouch.value) {
    cutArea.value = {
      top: currentPoint.y,
      right: currentPoint.x,
      bottom: currentPoint.y,
      left: currentPoint.x,
    };
    firstTouch.value = false;
  }
  pointToLine(currentLines);
};
// 笔迹移动
const uploadScaleMove = (e) => {
  if (e.type != 'touchmove') return false;
  if (e.cancelable) {
    // 判断默认行为是否已经被禁用
    if (!e.defaultPrevented) {
      e.preventDefault();
    }
  }
  let point = {
    x: e.touches[0].x,
    y: e.touches[0].y,
  };
  //测试裁剪
  if (point.y < cutArea.value.top) {
    cutArea.value.top = point.y;
  }
  if (point.y < 0) cutArea.value.top = 0;

  if (point.x > cutArea.value.right) {
    cutArea.value.right = point.x;
  }
  if (canvasWidth.value - point.x <= 0) {
    cutArea.value.right = canvasWidth.value;
  }
  if (point.y > cutArea.value.bottom) {
    cutArea.value.bottom = point.y;
  }
  if (canvasHeight.value - point.y <= 0) {
    cutArea.value.bottom = canvasHeight.value;
  }
  if (point.x < cutArea.value.left) {
    cutArea.value.left = point.x;
  }
  if (point.x < 0) cutArea.value.left = 0;

  lastPoint.value = currentPoint.value;
  currentPoint.value = point;

  let currentLines = currentLine.value;
  currentLines.unshift({
    time: new Date().getTime(),
    dis: distance(currentPoint.value, lastPoint.value),
    x: point.x,
    y: point.y,
  });
  pointToLine(currentLines);
};
// 笔迹结束
const uploadScaleEnd = (e) => {
  if (e.type != 'touchend') return 0;
  let point = {
    x: e.changedTouches[0].x,
    y: e.changedTouches[0].y,
  };
  lastPoint.value = currentPoint.value;
  currentPoint.value = point;

  let currentLines = currentLine.value;
  currentLines.unshift({
    time: new Date().getTime(),
    dis: distance(currentPoint.value, lastPoint.value),
    x: point.x,
    y: point.y,
  });

  if (currentLines.length > 2) {
    var info = (currentLines[0].time - currentLines[currentLines.length - 1].time) / currentLines.length;
    //$("#info").text(info.toFixed(2));
  }
  //一笔结束，保存笔迹的坐标点，清空，当前笔迹
  //增加判断是否在手写区域；
  pointToLine(currentLines);
  var currentChirography = {
    lineSize: lineSize.value,
    lineColor: lineColor.value,
  };
  var chirographys = chirography.value;
  chirographys.unshift(currentChirography);
  chirography.value = chirographys;

  var linePracks = linePrack.value;
  linePracks.unshift(currentLine.value);
  linePrack.value = linePracks;
  currentLine.value = [];
};
//画两点之间的线条；参数为:line，会绘制最近的开始的两个点；
const pointToLine = (line) => {
  calcBethelLine(line);
  return;
};
//计算插值的方式；
const calcBethelLine = (line) => {
  if (line.length <= 1) {
    line[0].r = radius.value;
    return;
  }
  let x0,
    x1,
    x2,
    y0,
    y1,
    y2,
    r0,
    r1,
    r2,
    len,
    lastRadius,
    dis = 0,
    time = 0,
    curveValue = 0.5;
  if (line.length <= 2) {
    x0 = line[1].x;
    y0 = line[1].y;
    x2 = line[1].x + (line[0].x - line[1].x) * curveValue;
    y2 = line[1].y + (line[0].y - line[1].y) * curveValue;
    //x2 = line[1].x;
    //y2 = line[1].y;
    x1 = x0 + (x2 - x0) * curveValue;
    y1 = y0 + (y2 - y0) * curveValue;
  } else {
    x0 = line[2].x + (line[1].x - line[2].x) * curveValue;
    y0 = line[2].y + (line[1].y - line[2].y) * curveValue;
    x1 = line[1].x;
    y1 = line[1].y;
    x2 = x1 + (line[0].x - x1) * curveValue;
    y2 = y1 + (line[0].y - y1) * curveValue;
  }
  //从计算公式看，三个点分别是(x0,y0),(x1,y1),(x2,y2) ；(x1,y1)这个是控制点，控制点不会落在曲线上；实际上，这个点还会手写获取的实际点，却落在曲线上
  len = distance(
    {
      x: x2,
      y: y2,
    },
    {
      x: x0,
      y: y0,
    },
  );
  lastRadius = radius.value;
  for (let n = 0; n < line.length - 1; n++) {
    dis += line[n].dis;
    time += line[n].time - line[n + 1].time;
    if (dis > smoothness.value) break;
  }

  radius.value = Math.min((time / len) * pressure.value + lineMin.value, lineMax.value) * lineSize.value;
  line[0].r = radius.value;
  //计算笔迹半径；
  if (line.length <= 2) {
    r0 = (lastRadius + radius.value) / 2;
    r1 = r0;
    r2 = r1;
    //return;
  } else {
    r0 = (line[2].r + line[1].r) / 2;
    r1 = line[1].r;
    r2 = (line[1].r + line[0].r) / 2;
  }
  let n = 5;
  let point = [];
  for (let i = 0; i < n; i++) {
    let t = i / (n - 1);
    let x = (1 - t) * (1 - t) * x0 + 2 * t * (1 - t) * x1 + t * t * x2;
    let y = (1 - t) * (1 - t) * y0 + 2 * t * (1 - t) * y1 + t * t * y2;
    let r = lastRadius + ((radius.value - lastRadius) / n) * i;
    point.push({
      x: x,
      y: y,
      r: r,
    });
    if (point.length == 3) {
      let a = ctaCalc(point[0].x, point[0].y, point[0].r, point[1].x, point[1].y, point[1].r, point[2].x, point[2].y, point[2].r);
      a[0].color = lineColor.value;
      // let bethelPoint = this.bethelPoint;
      // bethelPoint = bethelPoint.push(a);
      bethelDraw(a, 1);
      point = [
        {
          x: x,
          y: y,
          r: r,
        },
      ];
    }
  }
  currentLine.value = line;
};
//求两点之间距离
const distance = (a, b) => {
  let x = b.x - a.x;
  let y = b.y - a.y;
  return Math.sqrt(x * x + y * y);
};
const ctaCalc = (x0, y0, r0, x1, y1, r1, x2, y2, r2) => {
  let a = [],
    vx01,
    vy01,
    norm,
    n_x0,
    n_y0,
    vx21,
    vy21,
    n_x2,
    n_y2;
  vx01 = x1 - x0;
  vy01 = y1 - y0;
  norm = Math.sqrt(vx01 * vx01 + vy01 * vy01 + 0.0001) * 2;
  vx01 = (vx01 / norm) * r0;
  vy01 = (vy01 / norm) * r0;
  n_x0 = vy01;
  n_y0 = -vx01;
  vx21 = x1 - x2;
  vy21 = y1 - y2;
  norm = Math.sqrt(vx21 * vx21 + vy21 * vy21 + 0.0001) * 2;
  vx21 = (vx21 / norm) * r2;
  vy21 = (vy21 / norm) * r2;
  n_x2 = -vy21;
  n_y2 = vx21;
  a.push({
    mx: x0 + n_x0,
    my: y0 + n_y0,
    color: '#1A1A1A',
  });
  a.push({
    c1x: x1 + n_x0,
    c1y: y1 + n_y0,
    c2x: x1 + n_x2,
    c2y: y1 + n_y2,
    ex: x2 + n_x2,
    ey: y2 + n_y2,
  });
  a.push({
    c1x: x2 + n_x2 - vx21,
    c1y: y2 + n_y2 - vy21,
    c2x: x2 - n_x2 - vx21,
    c2y: y2 - n_y2 - vy21,
    ex: x2 - n_x2,
    ey: y2 - n_y2,
  });
  a.push({
    c1x: x1 - n_x2,
    c1y: y1 - n_y2,
    c2x: x1 - n_x0,
    c2y: y1 - n_y0,
    ex: x0 - n_x0,
    ey: y0 - n_y0,
  });
  a.push({
    c1x: x0 - n_x0 - vx01,
    c1y: y0 - n_y0 - vy01,
    c2x: x0 + n_x0 - vx01,
    c2y: y0 + n_y0 - vy01,
    ex: x0 + n_x0,
    ey: y0 + n_y0,
  });
  a[0].mx = a[0].mx.toFixed(1);
  a[0].mx = parseFloat(a[0].mx);
  a[0].my = a[0].my.toFixed(1);
  a[0].my = parseFloat(a[0].my);
  for (let i = 1; i < a.length; i++) {
    a[i].c1x = a[i].c1x.toFixed(1);
    a[i].c1x = parseFloat(a[i].c1x);
    a[i].c1y = a[i].c1y.toFixed(1);
    a[i].c1y = parseFloat(a[i].c1y);
    a[i].c2x = a[i].c2x.toFixed(1);
    a[i].c2x = parseFloat(a[i].c2x);
    a[i].c2y = a[i].c2y.toFixed(1);
    a[i].c2y = parseFloat(a[i].c2y);
    a[i].ex = a[i].ex.toFixed(1);
    a[i].ex = parseFloat(a[i].ex);
    a[i].ey = a[i].ey.toFixed(1);
    a[i].ey = parseFloat(a[i].ey);
  }
  return a;
};
const bethelDraw = (point, is_fill, color = '') => {
  let ctxs = ctx.value;
  ctxs.beginPath();
  ctxs.moveTo(point[0].mx, point[0].my);
  if (undefined != color) {
    ctxs.setFillStyle(color);
    ctxs.setStrokeStyle(color);
  } else {
    ctxs.setFillStyle(point[0].color);
    ctxs.setStrokeStyle(point[0].color);
  }
  for (let i = 1; i < point.length; i++) {
    ctxs.bezierCurveTo(point[i].c1x, point[i].c1y, point[i].c2x, point[i].c2y, point[i].ex, point[i].ey);
  }
  ctxs.stroke();
  if (undefined != is_fill) {
    ctxs.fill(); //填充图形 ( 后绘制的图形会覆盖前面的图形, 绘制时注意先后顺序 )
  }
  ctxs.draw(true);
};

// 重写
const retDraw = () => {
  if (flag.value) flag.value = false;
  ctx.value?.clearRect(0, 0, 700, 730);
  ctx.value?.draw();
  //设置canvas背景
  setCanvasBg('#fff');
};
// 预览
const previewCanvasImg = () => {
  uni.canvasToTempFilePath({
    canvasId: 'handWriting',
    fileType: 'jpg',
    quality: 1, //图片质量
    success(res) {
      // console.log(res.tempFilePath, 'canvas生成图片地址');
      uni.previewImage({
        urls: [res.tempFilePath], //预览图片 数组
      });
    },
  });
};
// 完成
const subCanvas = () => {
  if (!flag.value) {
    uni.showToast({
      title: '请完成签名哦',
    });
    return;
  }
  ctx.value?.draw(true, () => {
    uni.canvasToTempFilePath({
      canvasId: 'handWriting',
      fileType: 'png',
      quality: 1, //图片质量
      success: async (res) => {
        const rotatedImageURL = await rotate90(res.tempFilePath); //旋转90deg 可自行调整
        uni.setStorageSync('signature', rotatedImageURL);
        // 待上传签名图片
        back();
      },
    });
  });
};
// 旋转90deg
const rotate90 = async (url) => {
  const canvasWidths = canvasWidth.value; // Canvas的宽度
  const canvasHeights = canvasHeight.value; // Canvas的高度
  // 创建一个新的Canvas用于旋转和绘制签名
  const rotatedCanvas = uni.createCanvasContext('rotatedCanvas', this);
  // 清空Canvas
  rotatedCanvas.clearRect(0, 0, canvasWidths, canvasHeights);
  // 将坐标原点移到中心点
  const centerX = canvasWidths / 2; // 中心点的X坐标
  const centerY = canvasHeights / 2; // 中心点的Y坐标
  // 保存当前状态
  rotatedCanvas.save();
  // 将坐标原点移到中心点，并旋转90度
  rotatedCanvas.translate(centerX, centerY);
  rotatedCanvas.rotate((-90 * Math.PI) / 180);
  // 将图像绘制到旋转的画布上，并调整位置以确保图像在正确位置显示
  rotatedCanvas.drawImage(url, -canvasHeights / 2, -canvasWidths / 2, canvasHeights, canvasWidths);
  rotatedCanvas.restore();
  // 完成绘制并生成临时文件路径
  return new Promise((resolve, reject) => {
    rotatedCanvas.draw(true, () => {
      uni.canvasToTempFilePath({
        canvasId: 'rotatedCanvas',
        fileType: 'png',
        quality: 1, // 图片质量
        success: (res) => {
          resolve(res.tempFilePath); // 返回旋转后的临时文件路径
        },
        fail: (err) => {
          console.error('canvasToTempFilePath error:', err);
          reject('生成旋转后的图片失败');
        },
      });
    });
  });
};
// 返回
const back = () => {
  uni.navigateBack();
};
</script>

<style scoped lang="scss">
page {
  background: #fbfbfb;
  height: 100%;
  padding-top: 30rpx;
  box-sizing: border-box;
  overflow: hidden;
}

.wrapper {
  width: 100%;
  height: 95vh;
  // margin: 30rpx 0;
  margin: 2.5vh 0;
  overflow: hidden;
  display: flex;
  align-content: center;
  flex-direction: row;
  justify-content: center;
  font-size: 28rpx;
}

.handWriting {
  background: #fff;
  width: 100%;
  height: 95vh;
}

.handRight {
  display: inline-flex;
  align-items: center;
  position: relative;
}

.icon-box {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 50rpx;
  display: flex;
  justify-content: center;
}

.icon {
  transform: rotate(90deg);
  width: 20rpx;
  height: 30rpx;
}

.handCenter {
  border: 4rpx dashed #e9e9e9;
  flex: 5;
  overflow: hidden;
  box-sizing: border-box;
  background: red;
  position: relative;
}

.name-box {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9;
  pointer-events: none;
  display: flex;
  justify-content: space-around;
  align-items: center;
  opacity: 0.5;
  font-size: 300rpx;
  writing-mode: vertical-rl;
  word-wrap: break-word;
  text-shadow: 10rpx 10rpx 5rpx #829fcc;
  color: #fff;
  font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
}

.rotate90 {
  transform: rotate(90deg);
}

.handTitle {
  transform: rotate(90deg);
  flex: 1;
  color: #666;
}

.handBtn button {
  font-size: 28rpx;
}

.handBtn {
  height: 95vh;
  display: inline-flex;
  flex-direction: column;
  justify-content: space-between;
  align-content: space-between;
  flex: 1;
}

.delBtn {
  position: absolute;
  top: 250rpx;
  left: 0rpx;
  transform: rotate(90deg);
  color: #666;
}

.delBtn image {
  position: absolute;
  top: 13rpx;
  left: 25rpx;
}

.subBtn {
  position: absolute;
  bottom: 52rpx;
  left: -3rpx;
  display: inline-flex;
  transform: rotate(90deg);
  background: #008ef6;
  color: #fff;
  margin-bottom: 30rpx;
  text-align: center;
  justify-content: center;
}

.previewBtn {
  position: absolute;
  top: 375rpx;
  left: 0rpx;
  transform: rotate(90deg);
  color: #666;
}

/*Peach - 新增 - 保存*/

.black-select {
  width: 60rpx;
  height: 60rpx;
  position: absolute;
  top: 30rpx;
  left: 25rpx;
}

.black-select.color_select {
  width: 90rpx;
  height: 90rpx;
  top: 100rpx;
  left: 10rpx;
}

.red-select {
  width: 60rpx;
  height: 60rpx;
  position: absolute;
  top: 140rpx;
  left: 25rpx;
}

.red-select.color_select {
  width: 90rpx;
  height: 90rpx;
  top: 120rpx;
  left: 10rpx;
}
</style>