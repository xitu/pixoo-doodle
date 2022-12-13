# Pixoo-doodle

为使用wifi方式连接的[Divoom-Pixoo](https://divoom.com/products/pixoo-64)设备提供画布。

# 使用方法

## 1. 安装

为了跨域，设备需要通过NodeJS建立一个代理服务，所以先clone本项目到本地，然后启动服务：

```bash
npm run server --host 192.168.0.5
```

需要把对应的host替换为设备的IP地址，这个地址可以在Divoom的App中通过wifi配网得到。

服务启动之后，就可以直接创建设备对象，获取context进行绘制了。

```js
import PixooDoodle from './pixoo-doodle.js';
const doodle = new PixooDoodle();
const ctx = doodle.context;

ctx.fillStyle = 'yellow';
ctx.fillRect(0, 0, 16, 16);
```

除了静态图片，还可以播放动画：

```js
import PixooDoodle from './pixoo-doodle.js';
const doodle = new PixooDoodle();

const ctx = new OffscreenCanvas(doodle.width, doodle.height).getContext('2d');
ctx.fillStyle = 'yellow';
ctx.fillRect(0, 0, 16, 16);
doodle.appendAnimationFrame(ctx.canvas, 500);
ctx.fillStyle = 'red';
ctx.fillRect(0, 0, 16, 16);
doodle.appendAnimationFrame(ctx.canvas, 500);
ctx.fillStyle = 'blue';
ctx.fillRect(0, 0, 16, 16);
doodle.appendAnimationFrame(ctx.canvas, 500);
doodle.playAnimation();
```

## 参考资料

[API 文档](http://doc.divoom-gz.com/web/?fbclid=IwAR2KBwT6h6FTfNDkprFvrgFrsicg6z0N7dYWNlX8qJd46T5fXkkvwJ-8Pdg#/12?page_id=143)