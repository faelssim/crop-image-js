# crop-image-js



---

**使用方式**

> npm i crop-image-js

    import Cropper from 'crop-image-js'
    import 'crop-image-js/index.css'
    ...
    new Cropper({
        src: 'xxx', // 待裁剪的图片的base64编码
        ok: (base64) => { ... }, // 裁剪后的base64编码
        cancel: () => { ... }, // 取消裁剪回调
    })




