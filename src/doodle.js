export class PixooDoodle {
  constructor({host = 'http://localhost:9527', width = 64, height = 64, ...options} = {}) {
    this._host = host;
    this._updateDelay = 0;
    this._context = new OffscreenCanvas(width, height).getContext('2d', {willReadFrequently: true, ...options});
    this._animationFrameCanvas = new OffscreenCanvas(width, height);
    this._animationFrames = [];
    const {fill, stroke, fillRect, strokeRect, fillText, strokeText, drawImage, clearRect} = this._context;
    [fill, stroke, fillRect, strokeRect, fillText, strokeText, drawImage, clearRect].forEach((fn) => {
      this._context[fn.name] = (...rest) => {
        const ret = fn.apply(this._context, rest);
        this.forceUpdate();
        return ret;
      };
    });
  }

  get width() {
    return this._context.canvas.width;
  }

  get height() {
    return this._context.canvas.height;
  }

  get context() {
    return this._context;
  }

  get canvas() {
    return this._context.canvas;
  }

  setUpdateLatency(latency = 0) {
    this._updateDelay = latency;
  }

  forceUpdate() {
    if(!this._updatePromise) {
      this._updatePromise = new Promise((resolve) => {
        if(this._updateDelay <= 0 && typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(() => {
            this._updatePromise = null;
            this.update();
            resolve();
          });
        } else {
          setTimeout(() => {
            this._updatePromise = null;
            this.update();
            resolve();
          }, this._updateDelay);
        }
      });
    }
    return this._updatePromise;
  }

  async send(payload) {
    const response = await (await fetch(`${this._host}/send`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    })).json();

    if(typeof CustomEvent === 'function') {
      const e = new CustomEvent('devicestatechange', {detail: {device: this, payload, response}});
      window.dispatchEvent(e);
    }

    return response;
  }

  async update() {
    const picData = this.getFrameData();
    const payload = {
      Command: 'Draw/SendHttpGif',
      PicWidth: this.width,
      PicNum: 1,
      PicID: Math.random().toString(16).slice(2),
      PicOffset: 0,
      PicData: picData,
      PicSpeed: 1,
    };
    await this.send(payload);
  }

  clear() {
    this._context.clearRect(0, 0, this.width, this.height);
  }

  setUpdateLatency(latency = 0) {
    this._updateDelay = latency;
  }

  getFrameData(frame = this._context) {
    const data = frame.getImageData(0, 0, this.width, this.height).data;
    const rgbData = [];
    for(let i = 0; i < this.width * this.height; i++) {
      const j = i * 4;
      rgbData.push(String.fromCharCode(data[j])
      , String.fromCharCode(data[j + 1])
      , String.fromCharCode(data[j + 2]));
    }
    return btoa(rgbData.join(''));
  }

  appendAnimationFrame(image, delay = 16) {
    const frame = this._animationFrameCanvas.getContext('2d', {willReadFrequently: true});
    frame.clearRect(0, 0, this.width, this.height);
    frame.drawImage(image, 0, 0, this.width, this.height);
    const picData = this.getFrameData(frame);
    this._animationFrames.push({picData, delay});
  }

  async clearAnimationFrames() {
    this._animationFrames.length = 0;
  }

  async playAnimation(frames = this._animationFrames) {
    if(frames.length <= 0) {
      console.warn('no animation frames to update');
      return;
    }
    if(frames.length > 60) {
      console.warn('too many frames to update, max 60 frames');
      frames.length = 60;
    }
    const payload = {
      Command: 'Draw/SendHttpGif',
      PicWidth: this.width,
      PicNum: frames.length,
      PicID: Math.random().toString(16).slice(2),
    };

    for(let i = 0; i < frames.length; i++) {
      payload.PicOffset = i;
      const {picData, delay} = frames[i];
      payload.PicData = picData;
      payload.PicSpeed = delay;
      await this.send(payload);

      if(typeof CustomEvent === 'function') {
        const e = new CustomEvent('deviceuploadprogress', {detail: {device: this, progress: (i + 1) / frames.length}});
        window.dispatchEvent(e);
      }
    }
  }
}