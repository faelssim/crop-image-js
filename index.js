function Cropper(options) {
    // 配置
    this.options = options || {
        src: '',
        ok: function(val) {},
        fail: function () {
            console.log('%c生成图片失败', 'background:#333;color:#fff;padding:2px 7px;');
        }
    };
    // 鼠标事件的初始状态
    this._initMouseData = {
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        width: 0,
        height: 0
    };
    this._render();
    
}
Cropper.prototype._createHTML = function () {
    return (
        `<div class="cropper-box">
            <div>
                <div class="c-b-header">
                    <b>图片裁剪</b>
                    <span class="cropper-box-close">❎</span>
                </div>
                <div class="c-b-mid">
                    <div>
                        <div class="c-b-left">
                            <div class="c-b-main">
                                <div class="c-clip-area" data-type="box">
                                    <div class="c-clip-handle" data-type="handle"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="c-b-footer">
                    <button class="cropper-box-confirm">
                        <span>确定</span>
                    </button>
                </div>
            </div>
            <canvas id="cvs" style="display: none;"></canvas>   
        </div>`
    );
}
Cropper.prototype._render = function () {
    const HTML = this._createHTML();
    const dom = document.createElement('div');
    dom.innerHTML = HTML;
    this._el = dom.children[0];
    document.body.appendChild(this._el);
    // 关闭的按钮
    this._closeBtn = document.querySelector('.cropper-box-close');
    // 确定按钮
    this._confirmBtn = document.querySelector('.cropper-box-confirm');
    // 可裁剪区域
    this._clipArea = document.querySelector('.c-b-main');
    // 裁剪框
    this._clipBox = document.querySelector('.c-clip-area');
    // 裁剪框调整区
    this._clipHandle = document.querySelector('.c-clip-handle');
    // canavs
    this._canvas = document.querySelector('#cvs');
    // 绘制图片
    this._createImage();
}
Cropper.prototype._createImage = function() {
    const OFFSET_SIZE = 430;
    const img = new Image();
    img.src = this.options.src;
    img.onload = () => {
        const cvs = this._canvas;
        const cvs_cxt = cvs.getContext('2d');
        this._ori_img_width = img.width;
        this._ori_img_height = img.height;
        cvs.setAttribute('width', this._ori_img_width);
        cvs.setAttribute('height', this._ori_img_height);
        if (img.width >= img.height) {
            this._box_width = OFFSET_SIZE; // 可裁剪区域宽
            this._box_height = OFFSET_SIZE * img.height / img.width; // 可裁剪区域高
            this._crop_width = this._box_height; // 裁剪框宽
            this._crop_height = this._box_height; // 裁剪框高
            this._crop_left = (OFFSET_SIZE - this._crop_width) / 2; // 裁剪框左边距
            this._crop_top = 0; // 裁剪框上边距
        } else {
            this._box_height = OFFSET_SIZE;
            this._box_width = OFFSET_SIZE * img.width / img.height;
            this._crop_width = this._box_width;
            this._crop_height = this._box_width;
            this._crop_top = (OFFSET_SIZE - this._crop_width) / 2;
            this._crop_left = 0;
        }
        cvs_cxt.drawImage(img, 0, 0, this._ori_img_width, this._ori_img_height);
        this._clipArea.style = `width: ${this._box_width}px;height: ${this._box_height}px;background-image: url(${img.src});`;
        // 设置裁剪框样式
        this._setCropBox();
        // 设置鼠标事件
        this._setMouseEvents();
    }
}
Cropper.prototype._setCropBox = function () {
    this._clipBox.style = `width: ${this._crop_width}px;height: ${this._crop_height}px;top: ${this._crop_top}px;left: ${this._crop_left}px;`;
}
Cropper.prototype._setMouseEvents = function () {
    const self = this;
    this._clipBox.addEventListener('mousedown', function (e) {
        e.stopPropagation(); // 阻止冒泡
        self._mousedown(e, this);
    });
    this._clipHandle.addEventListener('mousedown', function (e) {
        e.stopPropagation(); // 阻止冒泡
        self._mousedown(e, this);
    });
    this._closeBtn.addEventListener('click', () => this._close());
    this._confirmBtn.addEventListener('click', () => this._confirm());
}
Cropper.prototype._mousedown = function (e, self) {
    const type = self.getAttribute('data-type');
    const { pageX, pageY } = e;
    this._initMouseData.x = pageX;
    this._initMouseData.y = pageY;
    if (type === 'box') {
        this._initMouseData.top = this._crop_top;
        this._initMouseData.left = this._crop_left;
    } else {
        this._initMouseData.width = this._crop_width;
        this._initMouseData.height = this._crop_height;
    }
    document.body._proto = this;
    document.body._type = type;
    document.body.addEventListener('mousemove', this._mousemove);
    document.body.addEventListener('mouseup', this._mouseup);
}
Cropper.prototype._mousemove = function (e) {
    const { _proto: self, _type } = this;
    const { pageX, pageY } = e;
    if (_type === 'box') {
        let left = self._initMouseData.left + pageX - self._initMouseData.x;
        let top = self._initMouseData.top + pageY - self._initMouseData.y;
        left = left < 0 ? 0 : left > self._box_width - self._crop_width ? self._box_width - self._crop_width : left;
        top = top < 0 ? 0 : top > self._box_height - self._crop_height ? self._box_height - self._crop_height : top;
        self._crop_left = left;
        self._crop_top = top;
    } else {
        let width = self._initMouseData.width + pageX - self._initMouseData.x;
        let height = self._initMouseData.height + pageY - self._initMouseData.y;
        width = width > self._box_width - self._crop_left ? self._box_width - self._crop_left : width;
        height = height > self._box_height - self._crop_top ? self._box_height - self._crop_top : height;
        self._crop_width = width;
        self._crop_height = height;
    }
    self._setCropBox();
}
Cropper.prototype._mouseup = function (e) {
    const { _proto: self, _type } = this;
    document.body.removeEventListener('mousemove', self._mousemove);
}
Cropper.prototype._close = function () {
    this._el && document.body.removeChild(this._el);
}
Cropper.prototype._confirm = function () {
    this._confirmBtn.setAttribute('disabled', true);
    setTimeout(() => {
        const base64 = this.getBase64();
        this.options.ok && this.options.ok(base64);
        this._confirmBtn.removeAttribute('disabled');
        this._close();
    }, 0);
}
// 获取裁剪的真实宽高和位置
Cropper.prototype._getClipData = function () {
    return {
        x: this._crop_left * this._ori_img_width / this._box_width,
        y: this._crop_top * this._ori_img_height / this._box_height,
        w: this._crop_width * this._ori_img_width / this._box_width,
        h: this._crop_height * this._ori_img_height / this._box_height
    }
}
Cropper.prototype.getBase64 = function() {
    const { x, y, w, h } = this._getClipData();
    const cvs = this._canvas;
    const cvs_cxt = cvs.getContext('2d');
    // 获取裁剪的像素点
    const imgData = cvs_cxt.getImageData(x, y, w, h);
    // 清除原画布
    cvs_cxt.clearRect(0, 0, this._ori_img_width, this._ori_img_height);
    // 重新设置画布大小
    cvs.setAttribute('width', w);
    cvs.setAttribute('height', h);
    // 将原来的像素点放置到重置后的画布
    cvs_cxt.putImageData(imgData, 0, 0, 0, 0, w, h);
    // 导出base64
    return cvs.toDataURL();
}
export default Cropper;