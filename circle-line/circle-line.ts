class Circle {
    x: number;
    y: number;
    r: number;
    v_x: number;
    v_y: number;
    color: string = 'rgba(204, 204, 204, 0.3)';

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.r = (Math.random() * 10) >> 0;
        if (this.r < 2) this.r = 2;
        // this.v_x = Math.random() * (Math.random() > .5 ? 1 : -1);
        // this.v_y = Math.random() * (Math.random() > .5 ? 1 : -1);
        this.v_x = this.getVelocity();
        this.v_y = this.getVelocity();
    }
    getVelocity(min: number = 0.2, max: number = 0.8) {
        const f = Math.random() > 0.5 ? 1 : -1;
        let v = Math.random();
        if (v < min) {
            v = min;
        } else if (v > max) {
            v = max;
        }
        return f * v * 0.8;
    }
    move(w: number, h: number): Circle {
        // 超出屏幕范围则速度反向 模拟反弹
        if (w && h) {
            this.v_x = this.x + this.r < w && this.x - this.r > 0 ? this.v_x : -this.v_x;
            this.v_y = this.y + this.r < h && this.y - this.r > 0 ? this.v_y : -this.v_y;
        }
        this.x += this.v_x;
        this.y += this.v_y;
        return this;
    }
    moveAimTo(x: number, y: number) {
        var v_x = (x - this.x) / 360;
        var v_y = (y - this.y) / 360;
        this.x -= v_x;
        this.y -= v_y;
        return this;
    }
}

class CurrCircle extends Circle {
    color: string;
    inActive: boolean;
    isCurrent: boolean = true;
    constructor(x: number, y: number) {
        super(x, y);
        this.r = 12;
        this.color = 'rgba(255, 77, 54, 0.6)';
        this.inActive = false;
    }
}

class Drawer {
    canvas: HTMLCanvasElement;
    num: number;
    w: number;
    h: number;
    ctx: CanvasRenderingContext2D;
    circles: Array<Circle>;
    mouseCircle: CurrCircle;
    mouseRelatedCircles: Circle[];
    mouseRelatedCirclesSorted: boolean;
    requestAnimationFrameID: number | undefined = undefined;

    constructor(canvas: HTMLCanvasElement, num: number = 50, w: number, h: number) {
        this.canvas = canvas;
        this.num = num;
        canvas.width = w;
        canvas.height = h;
        this.ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
        this.w = w;
        this.h = h;
        this.circles = [];
        this.mouseRelatedCircles = [];
        this.mouseRelatedCirclesSorted = false;
        this.mouseCircle = new CurrCircle(0, 0);

        this.init();
    }
    drawLine(c: Circle | CurrCircle, o: Circle, force: boolean = false) {
        const dx = c.x - o.x;
        const dy = c.y - o.y;
        // 如果距离太远、太近就不连线了
        var dis: number = Math.sqrt(dx * dx + dy * dy);
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
    }
    drawCircle(c: Circle) {
        this.ctx.beginPath();
        // 画
        this.ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        // 填充颜色
        this.ctx.fillStyle = c.color;
        // 叠加样式
        this.ctx.globalCompositeOperation = 'destination-over';
        // 添加到画布
        this.ctx.fill();
    }
    drawActiveCircleLine(circleIds: number[], split_y: number) {
        if (!this.mouseRelatedCircles.length) {
            return;
        }

        // 按 x 方向排序
        this.mouseRelatedCircles.sort((c1, c2) => {
            return c1.x > c2.x ? 1 : -1;
        });

        // 分隔为上下两部分
        var tops: Circle[] = [];
        var bottoms: Circle[] = [];
        var dl = 0;
        this.mouseRelatedCircles.forEach(c => {
            // this.drawCircle(c.move(this.w, this.h));
            var m = getDl(this.mouseCircle, c);
            dl = m > dl ? m : dl;
            if (c.y >= split_y) {
                tops.push(c);
            } else {
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
        var arr: Circle[] = tops.concat(bottoms);
        var i: number = 0;
        var len: number = arr.length;
        var unitRadian = (Math.PI / 180) * (360 / len);
        this.drawLine(arr[i], arr[len - 1], true);
        for (i = 0; i < len - 1; i++) {
            // console.log(this.getAimPos(arr[i], unitRadian * (i + 1)));
            // arr[i].color = 'red';
            var aimPos = this.getAimPos(arr[i], unitRadian * (i + 1), dl);
            console.log(aimPos);
            arr[i].moveAimTo(aimPos[0], aimPos[1]);
            // arr[i].x = aimPos[0];
            // arr[i].y = aimPos[1];
            this.drawCircle(arr[i]);
            this.drawLine(arr[i], arr[i + 1], true);
        }
        // arr[i].color = 'red';
        // var aimPos = this.getAimPos(arr[i], unitRadian * (i + 1), dl);
        // console.log(aimPos);
        // // arr[i].moveAimTo(aimPos[0], aimPos[1]);
        // arr[i].x = aimPos[0];
        // arr[i].y = aimPos[1];
        // this.drawCircle(arr[i]);
        // debugger;
        this.mouseRelatedCircles = [];
    }
    getAimPos(c: Circle, radian: number, dl: number): number[] {
        console.log(radian);
        var o_x = this.mouseCircle.x >> 0;
        var o_y = this.mouseCircle.y >> 0;
        var x = (-dl * Math.cos(radian)) >> 0;
        var y = (dl * Math.sin(radian)) >> 0;

        // console.log([o_x, o_y, dl, Math.cos(radian), Math.sin(radian)], [x, y], [o_x - x, o_y - y]);
        return [o_x - x, o_y - y];
    }
    draw() {
        this.stop();
        this.ctx.clearRect(0, 0, this.w, this.h);

        var relatedIndex: number[] = [];

        if (this.mouseCircle.inActive) {
            this.drawCircle(this.mouseCircle);
            for (let i = 0, l = this.circles.length; i < l; ++i) {
                // this.drawLine(this.mouseCircle, this.circles[i]);
                if (this.drawLine(this.mouseCircle, this.circles[i])) {
                    relatedIndex.push(i);
                    this.mouseRelatedCircles.push(this.circles[i]);
                }
            }

            if (relatedIndex.length) {
                this.drawActiveCircleLine(relatedIndex, this.mouseCircle.y);
            }
        } else {
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
    }
    move() {
        this.draw();
    }
    stop() {
        if (this.requestAnimationFrameID !== undefined) {
            window.cancelAnimationFrame(this.requestAnimationFrameID);
        }
    }
    destroy() {}
    init() {
        this.initEvent();
        for (let i = 0; i < this.num; i++) {
            this.circles.push(new Circle(Math.random() * this.w, Math.random() * this.h));
        }
        this.move();
    }
    initEvent() {
        document.addEventListener(
            'mousemove',
            e => {
                this.mouseCircle.inActive = true;
                this.mouseCircle.x = e.clientX;
                this.mouseCircle.y = e.clientY;
            },
            false
        );
        document.addEventListener(
            'mouseout',
            e => {
                this.mouseCircle.inActive = false;
            },
            false
        );
        let resizeTimer: number;
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

let canvasEl = <HTMLCanvasElement>document.getElementById('canvas');
let clDrawer = new Drawer(canvasEl, 60, canvasEl.clientWidth, canvasEl.clientHeight);
