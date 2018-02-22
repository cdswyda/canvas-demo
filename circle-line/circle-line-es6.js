class Circle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.r = Math.random() * 10;
        // this.v_x = Math.random() * (Math.random() > .5 ? 1 : -1);
        // this.v_y = Math.random() * (Math.random() > .5 ? 1 : -1);
        this.v_x = this.getVelocity();
        this.v_y = this.getVelocity();
    }
    getVelocity(min) {
        const f = Math.random() > 0.5 ? 1 : -1;
        let v = Math.random();
        if (v < (min || 0.2)) v = 0.2;
        return f * v;
    }
    move(w, h) {
        // 超出屏幕范围则速度反向 模拟反弹
        if (w && h) {
            this.v_x =
                this.x + this.r < w && this.x - this.r > 0
                    ? this.v_x
                    : -this.v_x;
            this.v_y =
                this.y + this.r < h && this.y - this.r > 0
                    ? this.v_y
                    : -this.v_y;
        }
        this.x += this.v_x;
        this.y += this.v_y;
        return this;
    }
}

class CurrCircle extends Circle {
    constructor(x, y) {
        super(x, y);
        this.r = 12;
        this.color = 'rgba(255, 77, 54, 0.6)';
        this.inActive = false;
    }
}

class Drawer {
    constructor(canvas, num, w, h) {
        this.canvas = canvas;
        canvas.width = w;
        canvas.height = h;
        this.ctx = canvas.getContext('2d');
        this.w = w;
        this.h = h;
        this.circles = [];
        this.mouseCircle = new CurrCircle(0, 0);
        this.init(num);
    }
    drawLine(c, o) {
        const dx = c.x - o.x;
        const dy = c.y - o.y;
        if (Math.sqrt(dx * dx + dy * dy) < Math.min(this.w, this.h) / 4) {
            this.ctx.beginPath();
            this.ctx.moveTo(c.x, c.y); //起始点
            this.ctx.lineTo(o.x, o.y); //终点
            this.ctx.closePath();
            this.ctx.strokeStyle = 'rgba(204, 204, 204, 0.3)';
            this.ctx.stroke();
        }
    }
    drawCircle(c) {
        this.ctx.beginPath();
        // 画
        this.ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        // 填充颜色
        this.ctx.fillStyle = c.color || 'rgba(204, 204, 204, 0.3)';
        // 叠加样式
        this.ctx.globalCompositeOperation = 'destination-over';
        // 添加到画布
        this.ctx.fill();
    }
    draw() {
        this.ctx.clearRect(0, 0, this.w, this.h);

        for (let i = 0, l = this.circles.length; i < l; i++) {
            this.drawCircle(this.circles[i].move(this.w, this.h));
            let j = i + 1;
            while (j < l) {
                this.drawLine(this.circles[i], this.circles[j]);
                j++;
            }
        }

        if (this.mouseCircle.inActive) {
            this.drawCircle(this.mouseCircle);
            for (let i = 0, l = this.circles.length; i < l; ++i) {
                this.drawLine(this.mouseCircle, this.circles[i]);
            }
        }

        this.requestAnimationFrameID = window.requestAnimationFrame(
            this.draw.bind(this)
        );
    }
    move() {
        if (!this.requestAnimationFrameID) {
            this.draw();
        }
    }
    stop() {
        if (this.requestAnimationFrameID) {
            window.cancelAnimationFrame(this.requestAnimationFrameID);
        }
    }
    destroy() {}
    init(num) {
        this.initEvent();
        for (let i = 0; i < num; i++) {
            this.circles.push(
                new Circle(Math.random() * this.w, Math.random() * this.h)
            );
        }
        this.move();
    }
    initEvent() {
        this.canvas.addEventListener(
            'mousemove',
            e => {
                this.mouseCircle.inActive = true;
                this.mouseCircle.x = e.clientX;
                this.mouseCircle.y = e.clientY;
            },
            false
        );
        this.canvas.addEventListener(
            'mouseout',
            e => {
                this.mouseCircle.inActive = false;
            },
            false
        );
        let resizeTimer;
        window.addEventListener(
            'resize',
            e => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    const w = this.canvas.clientWidth;
                    const h = this.canvas.clientHeight;
                    this.canvas.width = this.w = w;
                    this.canvas.height = this.h = h;
                    // 调整边界
                    this.circles.forEach(c => {
                        if (c.x + c.r > w) c.x = w - c.r;
                        if (c.y + c.r > h) c.y = h - c.r;
                    });
                }, 17);
            },
            false
        );
    }
}

const canvasEl = document.getElementById('canvas');
let clDrawer = new Drawer(
    canvasEl,
    80,
    canvasEl.clientWidth,
    canvasEl.clientHeight
);
