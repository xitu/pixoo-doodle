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
import PixooDoodle from 'pixoo-doodle';
const doodle = new PixooDoodle();

const ctx = doodle.animationBegin();
ctx.fillStyle = 'yellow';
ctx.fillRect(0, 0, 16, 16);
doodle.appendAnimationFrame(500);
ctx.fillStyle = 'red';
ctx.fillRect(0, 0, 16, 16);
doodle.appendAnimationFrame(500);
doodle.animationEnd();
```
