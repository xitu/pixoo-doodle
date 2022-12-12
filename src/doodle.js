export class PixooDoodle {
  constructor({host = 'http://localhost:9527', width = 64, height = 64, options = {}} = {}) {
    this._host = host;
    this._updateDelay = 0;
    this._context = new OffscreenCanvas(width, height).getContext('2d', {willReadFrequently: true, ...options});
    this._animationFrames = [];
  }

  get width() {
    return this._context.canvas.width;
  }

  get height() {
    return this._context.canvas.height;
  }

  get canvas() {
    return this._context.canvas;
  }

  clear() {
    this._context.clearRect(0, 0, this.width, this.height);
  }

  setUpdateLatency(latency = 0) {
    this._updateDelay = latency;
  }

  animationBegin() {
    return this._context;
  }

  appendAnimationFrame(delay = 16) {
    const data = this._context.getImageData(0, 0, this.width, this.height).data;
    const rgbData = [];
    for(let i = 0; i < this.width * this.height; i++) {
      const j = i * 4;
      rgbData.push(String.fromCharCode(data[j])
      , String.fromCharCode(data[j + 1])
      , String.fromCharCode(data[j + 2]));
    }
    const picData = btoa(rgbData.join(''));
    this._animationFrames.push({picData, delay});
  }

  async animationEnd() {
    await this.update();
    this._animationFrames.length = 0;
  }

  async update() {
    if(this._animationFrames.length <= 0) {
      console.warn('no animation frames to update');
      return;
    }
    const payload = {
      Command: 'Draw/SendHttpGif',
      PicWidth: this.width,
      PicNum: this._animationFrames.length,
      PicID: Math.random().toString(16).slice(2),
    };

    let response;
    for(let i = 0; i < this._animationFrames.length; i++) {
      payload.PicOffset = i;
      const {picData, delay} = this._animationFrames[i];
      payload.PicData = picData;
      payload.PicSpeed = delay;
      response = await (await fetch(`${this._host}/send`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      })).json();
    }

    if(typeof CustomEvent === 'function') {
      const e = new CustomEvent('devicestatechange', {detail: {device: this, response}});
      window.dispatchEvent(e);
    }
  }
}