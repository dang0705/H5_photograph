
function photoFunc() {
    'use strict';
    var openid = '';
    var appid = 'uploadImg'
    function getUrlParam(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = location.search.substr(1).match(reg);
        if (r != null) return decodeURI(decodeURIComponent(decodeURI(r[2])));
        return null;
    }

    var console = window.console || {
        log: function() {
        }
    };
    var URL = window.URL || window.webkitURL;
    var $image = $('#image');
    var $download = $('#download');
    var $dataX = $('#dataX');
    var $dataY = $('#dataY');
    var $dataHeight = $('#dataHeight');
    var $dataWidth = $('#dataWidth');
    var $dataRotate = $('#dataRotate');
    var $dataScaleX = $('#dataScaleX');
    var $dataScaleY = $('#dataScaleY');
    var container = $('.container');
    var containerWidth = container.outerWidth();
    var containerHeight = container.outerHeight(true);
    var site = getUrlParam('site') || '1';
    var base64 = '';
    var result = '';
    console.log(containerWidth, containerHeight);
    var options = {
        minCropBoxWidth: containerWidth,
        minCropBoxHeight: containerHeight,
        minCanvasWidth: containerWidth,
        minCanvasHeight: containerHeight,
        minContainerWidth: containerWidth,
        minContainerHeight: containerHeight,
        viewMode: 0,
        dragCrop: false,
        // aspectRatio: 1 / 1,
        // resizable: false,
        cropBoxMovable: false,
        cropBoxResizable: false,
        guides: false, //裁剪框虚线 默认true有
        dragMode: "move",
        strict: false,
        autoCropArea: 1,
        scalable: false,
        modal: false,
        rotatable: true,
        preview: '.img-preview',
        /* aspectRatio: 16 / 9,
        preview: '.img-preview',*/
        crop: function(e) {
            /*var image = $('#image').get(0);
            var minWidth = image.naturalWidth * .6,
            minHeight = image.naturalHeight * .6;
            $('.cropper-container img').css({
            'min-width': minWidth,
            'min-height': minHeight
            });*/
            console.log(e)
            $('.cropper-container.cropper-bg').width(containerWidth).height(containerHeight);
            $dataX.val(Math.round(e.x));
            $dataY.val(Math.round(e.y));
            $dataHeight.val(Math.round(e.height));
            $dataWidth.val(Math.round(e.width));
            $dataRotate.val(e.rotate);
            $dataScaleX.val(e.scaleX);
            $dataScaleY.val(e.scaleY);
        }
    };
    var originalImageURL = $image.attr('src');
    var uploadedImageType = 'image/jpeg';
    var uploadedImageURL;
    var isPost = false,
		isFinish = false,
		isClick = false;

    // Tooltip


    // Cropper
    $image.on({
        ready: function(e) {
            console.log(e.type);
        },
        cropstart: function(e) {
            console.log(e.type, e.action);
        },
        cropmove: function(e) {
            console.log(e.type, e.action);
        },
        cropend: function(e) {
            console.log(e.type, e.action);
        },
        crop: function(e) {
            console.log(e.type, e.x, e.y, e.width, e.height, e.rotate, e.scaleX, e.scaleY);
        },
        zoom: function(e) {
            console.log(e.type, e.ratio);
        }
    }).cropper(options);


    // Buttons
    if (!$.isFunction(document.createElement('canvas').getContext)) {
        $('button[data-method="getCroppedCanvas"]').prop('disabled', true);
    }

    if (typeof document.createElement('cropper').style.transition === 'undefined') {
        $('button[data-method="rotate"]').prop('disabled', true);
        $('button[data-method="scale"]').prop('disabled', true);
    }


    // Download
    /*	if ( typeof $download[ 0 ].download === 'undefined' ) {
    $download.addClass('disabled');
    }*/


    // Options
    $('.docs-toggles').on('change', 'input', function() {
        var $this = $(this);
        var name = $this.attr('name');
        var type = $this.prop('type');
        var cropBoxData;
        var canvasData;

        if (!$image.data('cropper')) {
            return;
        }

        if (type === 'checkbox') {
            options[name] = $this.prop('checked');
            cropBoxData = $image.cropper('getCropBoxData');
            canvasData = $image.cropper('getCanvasData');

            options.ready = function() {
                $image.cropper('setCropBoxData', cropBoxData);
                $image.cropper('setCanvasData', canvasData);
            };
        } else if (type === 'radio') {
            options[name] = $this.val();
        }

        $image.cropper('destroy').cropper(options);
    });


    // Methods
    $('.docs-buttons').on('click', '[data-method]', function() {
        var $this = $(this);
        var data = $this.data();
        var $target;

        if ($this.prop('disabled') || $this.hasClass('disabled')) {
            return;
        }

        if ($image.data('cropper') && data.method) {
            data = $.extend({}, data); // Clone a new one

            if (typeof data.target !== 'undefined') {
                $target = $(data.target);

                if (typeof data.option === 'undefined') {
                    try {
                        data.option = JSON.parse($target.val());
                    } catch (e) {
                        console.log(e.message);
                    }
                }
            }

            switch (data.method) {
                case 'rotate':
                    $image.cropper('clear');
                    break;

                case 'getCroppedCanvas':
                    if (uploadedImageType === 'image/jpeg') {
                        if (!data.option) {
                            data.option = {};
                        }

                        data.option.fillColor = '#fff';
                    }

                    break;
            }

            result = $image.cropper(data.method, data.option, data.secondOption);

            switch (data.method) {
                case 'rotate':
                    $image.cropper('crop');
                    break;

                case 'scaleX':
                case 'scaleY':
                    $(this).data('option', -data.option);
                    break;

                case 'getCroppedCanvas':
                    if (isFinish) {
                        alert('您已成功上传相片,无法再次上传');
                        return;
                    }
                    if (result) {
                        // Bootstrap's Modal
                        base64 = result.toDataURL(uploadedImageType);
                        if (base64.indexOf('data:,') > -1) {
                            alert('未检测到您的相片,请放大后再提交');
                            return;
                        } else {
                        if (!isPost && !isClick) {
                                $('#modal').show();
                                isClick = true;
                                $.ajax({
                                    type: 'POST',
                                    url: 'https://api.shi1.cn/yl/YLHandler.ashx',
                                    timeout: 10000,
                                    data: {
                                        type: 'PrizeClawB',
                                        action: 'dzdpuploadpic',
                                        image: encodeURIComponent(base64),
                                        subs: index
                                    },
                                    success: function(data) {
                                        //alert(JSON.stringify(data))
                                        //data = JSON.parse(data)
                                        if (data.Status == 200) {
                                            alert('您的照片已成功上传!');
                                            keyid=data.keyid
                                            var photoUrl = 'data:image/jpeg;base64,' + decodeURIComponent(data.image)
                                            $('#uploadImg').hide()
                                            $('#finalImg').attr('src', photoUrl).show();
                                            $body.css(bg, 'url(images/bg3.jpg)')
                                            share();
                                            wx.showOptionMenu();
                                            isPost = true;
                                            isFinish = true;
                                            $('#modal').hide();
                                        }
                                        else if(data.Status==400){
                                           alert('未检测到人脸,请重新合成或上传新图片')
                                           isPost = false;
                                           isFinish = false;
                                           isClick = false;
                                           $('#modal').hide()
                                        }
                                        else if (data.Status == 403) {
                                           alert('抱歉...网络开了会小差,请稍后重试')
                                           isPost = false;
                                           isFinish = false;
                                           isClick = false;
                                           $('#modal').hide()
                                        }
                                        else {
                                           alert('未知错误,请重新合成或上传新图片')
                                           isPost = false;
                                           isFinish = false;
                                           isClick = false;
                                           $('#modal').hide();
                                        }
                                    },
                                    error: function() {
                                        isClick = false;

                                    },
                                    complete: function(XMLHttpRequest, status) { //请求完成后最终执行参数
                                        if (status == 'timeout' || status == 'error') {//超时,status还有success,error等值的情况
                                            isPost = false;
                                            isFinish = false;
                                            isClick = false;
                                            $('#modal').hide();
//                                            $('.modal-backdrop,#modal,#getCroppedCanvasModal').hide();
                                            alert('响应超时,请重新上传');
                                        }
                                    }
                                })

                            } else {
                                alert('您已成功上传相片,无法再次上传');
                            }
                        }
                    }
                    else {
                        alert('请上传至少一张照片');
                    }

                    break;

                case 'destroy':
                    if (uploadedImageURL) {
                        URL.revokeObjectURL(uploadedImageURL);
                        uploadedImageURL = '';
                        $image.attr('src', originalImageURL);
                    }

                    break;
            }

            if ($.isPlainObject(result) && $target) {
                try {
                    $target.val(JSON.stringify(result));
                } catch (e) {
                    console.log(e.message);
                }
            }

        }
    });
    $download.on('touchstart', function() {

    });

    // Keyboard
    $(document.body).on('keydown', function(e) {

        if (!$image.data('cropper') || this.scrollTop > 300) {
            return;
        }

        switch (e.which) {
            case 37:
                e.preventDefault();
                $image.cropper('move', -1, 0);
                break;

            case 38:
                e.preventDefault();
                $image.cropper('move', 0, -1);
                break;

            case 39:
                e.preventDefault();
                $image.cropper('move', 1, 0);
                break;

            case 40:
                e.preventDefault();
                $image.cropper('move', 0, 1);
                break;
        }

    });


    // Import image
    var $inputImage = $('#inputImage');

    if (URL) {
        $inputImage.change(function() {
            var files = this.files;
            var file;
            // $('#bigPhotoBtn').hide();

            if (!$image.data('cropper')) {
                return;
            }

            if (files && files.length) {
                file = files[0];

                if (/^image\/\w+$/.test(file.type)) {
                    uploadedImageType = file.type;

                    if (uploadedImageURL) {
                        URL.revokeObjectURL(uploadedImageURL);
                    }

                    uploadedImageURL = URL.createObjectURL(file);
                    $image.cropper('destroy').attr('src', uploadedImageURL).cropper(options);
                    $inputImage.val('');
                } else {
                    window.alert('请上传一张照片');
                }
            }
        });
    } else {
        $inputImage.prop('disabled', true).parent().addClass('disabled');
    }

};
photoFunc()