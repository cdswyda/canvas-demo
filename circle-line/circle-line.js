"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Circle = /** @class */ (function () {
    function Circle(x, y) {
        this.color = 'rgba(204, 204, 204, 0.3)';
        this.x = x;
        this.y = y;
        this.r = (Math.random() * 10) >> 0;
        if (this.r < 2)
            this.r = 2;
        // this.v_x = Math.random() * (Math.random() > .5 ? 1 : -1);
        // this.v_y = Math.random() * (Math.random() > .5 ? 1 : -1);
        this.v_x = this.getVelocity();
        this.v_y = this.getVelocity();
    }
    Circle.prototype.getVelocity = function (min, max) {
        if (min === void 0) { min = 0.2; }
        if (max === void 0) { max = 0.8; }
        var f = Math.random() > 0.5 ? 1 : -1;
        var v = Math.random();
        if (v < min) {
            v = min;
        }
        else if (v > max) {
            v = max;
        }
        return f * v * 0.8;
    };
    Circle.prototype.move = function (w, h) {
        // 超出屏幕范围则速度反向 模拟反弹
        if (w && h) {
            this.v_x = this.x + this.r < w && this.x - this.r > 0 ? this.v_x : -this.v_x;
            this.v_y = this.y + this.r < h && this.y - this.r > 0 ? this.v_y : -this.v_y;
        }
        this.x += this.v_x;
        this.y += this.v_y;
        return this;
    };
    Circle.prototype.moveToward = function (x, y) {
        var v_x = (x - this.x) / 360;
        var v_y = (y - this.y) / 360;
        this.x -= v_x;
        this.y -= v_y;
        return this;
    };
    return Circle;
}());
var CurrCircle = /** @class */ (function (_super) {
    __extends(CurrCircle, _super);
    function CurrCircle(x, y) {
        var _this = _super.call(this, x, y) || this;
        _this.isCurrent = true;
        _this.r = 12;
        _this.color = 'rgba(255, 77, 54, 0.6)';
        _this.inActive = false;
        return _this;
    }
    return CurrCircle;
}(Circle));
var Drawer = /** @class */ (function () {
    function Drawer(canvas, num, w, h) {
        if (num === void 0) { num = 50; }
        this.requestAnimationFrameID = undefined;
        this.canvas = canvas;
        this.num = num;
        canvas.width = w;
        canvas.height = h;
        this.ctx = canvas.getContext('2d');
        this.w = w;
        this.h = h;
        this.circles = [];
        this.mouseRelatedCircles = [];
        this.mouseRelatedCirclesSorted = false;
        this.mouseCircle = new CurrCircle(0, 0);
        this.init();
    }
    Drawer.prototype.drawLine = function (c, o, force) {
        if (force === void 0) { force = false; }
        var dx = c.x - o.x;
        var dy = c.y - o.y;
        // 如果距离太远、太近就不连线了
        var dis = Math.sqrt(dx * dx + dy * dy);
        if (force || (dis < Math.min(this.w, this.h) / 4 && (dis > 10 || c instanceof CurrCircle))) {
            this.ctx.beginPath();
            this.ctx.moveTo(c.x, c.y); //起始点
            this.ctx.lineTo(o.x, o.y); //终点
            this.ctx.closePath();
            this.ctx.strokeStyle = o.color;
            this.ctx.stroke();
            return true;
        }
        return false;
    };
    Drawer.prototype.drawCircle = function (c) {
        this.ctx.beginPath();
        // 画
        this.ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        // 填充颜色
        this.ctx.fillStyle = c.color;
        // 叠加样式
        this.ctx.globalCompositeOperation = 'destination-over';
        // 添加到画布
        this.ctx.fill();
    };
    Drawer.prototype.drawActiveCircleLine = function () {
        var _this = this;
        if (!this.mouseRelatedCircles.length) {
            return;
        }
        var split_y = this.mouseCircle.y;
        // 按 x 方向排序
        this.mouseRelatedCircles.sort(function (c1, c2) {
            return c1.x > c2.x ? 1 : -1;
        });
        // 分隔为上下两部分
        var tops = [];
        var bottoms = [];
        var dl = 0;
        this.mouseRelatedCircles.forEach(function (c) {
            // this.drawCircle(c.move(this.w, this.h));
            var m = getDl(_this.mouseCircle, c);
            dl = m > dl ? m : dl;
            if (c.y >= split_y) {
                tops.push(c);
            }
            else {
                bottoms.unshift(c);
            }
        });
        // tops.sort((c1, c2) => {
        //     if()
        //     return c1.x > c2.x ? 1 : -1;
        // });
        function getDl(c0, c) {
            var dx = c0.x - c.x;
            var dy = c0.y - c.y;
            return Math.sqrt(dx * dx + dy * dy);
        }
        // 连接成一个圈
        var arr = tops.concat(bottoms);
        var i = 0;
        var len = arr.length;
        var unitRadian = (Math.PI / 180) * (360 / len);
        this.drawLine(arr[i], arr[len - 1], true);
        for (i = 0; i < len - 1; i++) {
            // console.log(this.getAimPos(arr[i], unitRadian * (i + 1)));
            // arr[i].color = 'red';
            var aimPos = this.getAimPos(arr[i], unitRadian * (i + 1), dl);
            console.log(aimPos);
            // arr[i].x = aimPos[0];
            // arr[i].y = aimPos[1];
            this.drawCircle(arr[i]);
            this.drawLine(arr[i], arr[i + 1], true);
            arr[i].moveToward(aimPos[0], aimPos[1]);
        }
        // arr[i].color = 'red';
        var aimPos = this.getAimPos(arr[i], unitRadian * (i + 1), dl);
        console.log(aimPos);
        arr[i].moveToward(aimPos[0], aimPos[1]);
        // arr[i].x = aimPos[0];
        // arr[i].y = aimPos[1];
        this.drawCircle(arr[i]);
        // test
        arr.forEach(function (item, i) {
            _this.ctx.beginPath();
            var aimPos = _this.getAimPos(item, unitRadian * (i + 1), dl);
            _this.ctx.arc(aimPos[0], aimPos[1], 10, 0, Math.PI * 2);
            // 填充颜色
            _this.ctx.fillStyle = 'red';
            // 叠加样式
            _this.ctx.globalCompositeOperation = 'destination-over';
            // 添加到画布
            _this.ctx.fill();
            _this.ctx.beginPath();
            _this.ctx.moveTo(item.x, item.y); //起始点
            _this.ctx.lineTo(aimPos[0], aimPos[1]); //终点
            _this.ctx.closePath();
            _this.ctx.strokeStyle = 'red';
            _this.ctx.stroke();
        });
        // end
        // debugger;
        this.mouseRelatedCircles = [];
    };
    Drawer.prototype.getAimPos = function (c, radian, dl) {
        console.log(radian);
        var o_x = this.mouseCircle.x >> 0;
        var o_y = this.mouseCircle.y >> 0;
        var x = (-dl * Math.cos(radian)) >> 0;
        var y = (dl * Math.sin(radian)) >> 0;
        // console.log([o_x, o_y, dl, Math.cos(radian), Math.sin(radian)], [x, y], [o_x - x, o_y - y]);
        return [o_x - x, o_y - y];
    };
    Drawer.prototype.draw = function () {
        this.stop();
        this.ctx.clearRect(0, 0, this.w, this.h);
        var relatedIndex = [];
        if (this.mouseCircle.inActive) {
            this.drawCircle(this.mouseCircle);
            for (var i = 0, l = this.circles.length; i < l; ++i) {
                // this.drawLine(this.mouseCircle, this.circles[i]);
                if (this.drawLine(this.mouseCircle, this.circles[i])) {
                    relatedIndex.push(i);
                    this.mouseRelatedCircles.push(this.circles[i]);
                }
            }
            if (relatedIndex.length) {
                this.drawActiveCircleLine();
            }
        }
        else {
            this.mouseRelatedCircles = [];
        }
        // for (let i = 0, l = this.circles.length; i < l; i++) {
        //     if (relatedIndex.includes(i)) {
        //         continue;
        //     }
        //     this.drawCircle(this.circles[i]);
        //     let j = i + 1;
        //     while (j < l) {
        //         !relatedIndex.includes(j) && this.drawLine(this.circles[i], this.circles[j]);
        //         j++;
        //     }
        //     this.circles[i].move(this.w, this.h);
        // }
        this.requestAnimationFrameID = window.requestAnimationFrame(this.draw.bind(this));
    };
    Drawer.prototype.move = function () {
        this.draw();
    };
    Drawer.prototype.stop = function () {
        if (this.requestAnimationFrameID !== undefined) {
            window.cancelAnimationFrame(this.requestAnimationFrameID);
        }
    };
    Drawer.prototype.destroy = function () { };
    Drawer.prototype.init = function () {
        this.initEvent();
        for (var i = 0; i < this.num; i++) {
            this.circles.push(new Circle(Math.random() * this.w, Math.random() * this.h));
        }
        this.move();
    };
    Drawer.prototype.initEvent = function () {
        var _this = this;
        document.addEventListener('mousemove', function (e) {
            _this.mouseCircle.inActive = true;
            _this.mouseCircle.x = e.clientX;
            _this.mouseCircle.y = e.clientY;
        }, false);
        document.addEventListener('mouseout', function (e) {
            _this.mouseCircle.inActive = false;
        }, false);
        var resizeTimer;
        window.addEventListener('resize', function (e) {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                var w = _this.canvas.clientWidth;
                var h = _this.canvas.clientHeight;
                _this.canvas.width = _this.w = w;
                _this.canvas.height = _this.h = h;
                // 调整边界
                _this.circles.forEach(function (c) {
                    if (c.x + c.r > w)
                        c.x = w - c.r;
                    if (c.y + c.r > h)
                        c.y = h - c.r;
                });
            }, 17);
        }, false);
    };
    return Drawer;
}());
var canvasEl = document.getElementById('canvas');
var clDrawer = new Drawer(canvasEl, 60, canvasEl.clientWidth, canvasEl.clientHeight);
