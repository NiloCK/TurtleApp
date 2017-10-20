// class Animation {}
class Pen {
    color: string;
    width: number;
}

class QueueTree<T>{
    private queue: Array<T> = new Array<T>();
    private children: Array<QueueTree<T>> = new Array<QueueTree<T>>();

    enqueue(element: T): void {
        this.queue.push(element);
    }
    dequeue(): T | null {
        let ret = this.queue.shift();

        if (ret) {
            return ret;
        }
        else {
            return null;
        }
    }
    yieldChildren(): Array<QueueTree<T>> {
        return this.children;
    }
    addChild(child: QueueTree<T>): void {
        this.children.push(child);
    }
}

class CanvasStroke {
    initX: number;
    initY: number;

    finalX: number;
    finalY: number;

    angle: number;

    pen: Pen;
}

class Animator {
    private static instance: Animator;
    private animationQueues: Array<QueueTree<CanvasStroke>>;
    private lineDrawingCtx: CanvasRenderingContext2D;
    private turtleOverlayCtx: CanvasRenderingContext2D;
    private turtleImg: HTMLImageElement;

    private constructor(ctx: CanvasRenderingContext2D) {
        this.lineDrawingCtx = ctx;

        let overlayCtx = document.getElementById('turtleOverlayCanvas') as HTMLCanvasElement;
        this.turtleOverlayCtx = overlayCtx.getContext('2d') as CanvasRenderingContext2D;

        this.animationQueues = new Array<QueueTree<CanvasStroke>>();

        // this.turtleImg = new Image();
        // this.turtleImg.onload = () => {
        //     this.animate(); // always be animating!
        // }
        // this.turtleImg.src = './turtle/turtle.PNG';

        this.animate(); // always be animating!
    }
    /**
     * Draws a 'pizza slice' turtle
     */
    private drawTurtle(x: number, y: number, angle: number) {
        angle = angle + Math.PI;
        this.turtleOverlayCtx.fillStyle = 'green';
        this.turtleOverlayCtx.beginPath();
        this.turtleOverlayCtx.moveTo(x, y);
        this.turtleOverlayCtx.arc(x, y, 25, angle + (Math.PI / 8), angle - (Math.PI / 8), true);
        this.turtleOverlayCtx.fill();
    }

    private animate = () => {
        // console.log(`Animating ${this.animationQueues.length} turtles...`);

        let strokes = this.getFrameStrokes();
        this.turtleOverlayCtx.clearRect(0, 0, 10000, 10000);

        strokes.forEach(stroke => {
            this.lineDrawingCtx.strokeStyle = stroke.pen.color;
            this.lineDrawingCtx.lineWidth = stroke.pen.width;
            this.lineDrawingCtx.lineCap = "square";

            this.lineDrawingCtx.beginPath();
            this.lineDrawingCtx.moveTo(stroke.initX, stroke.initY);
            this.lineDrawingCtx.lineTo(stroke.finalX, stroke.finalY);
            this.lineDrawingCtx.stroke();

            // this.turtleOverlayCtx.drawImage(
            //     this.turtleImg,
            //     stroke.finalX,
            //     stroke.finalY,
            //     20, 20);
            this.drawTurtle(stroke.finalX, stroke.finalY, stroke.angle);

        });

        requestAnimationFrame(this.animate);
    }

    addTurtleAnimationQueue(queue: QueueTree<CanvasStroke>): void {
        this.animationQueues.push(queue);
    }

    private getFrameStrokes(): Array<CanvasStroke> {
        let ret = new Array<CanvasStroke>();
        // console.log(`Attempting to get frames from Turtles...`);
        // let newQueues: Array<QueueTree<CanvasStroke>> = new Array<QueueTree<CanvasStroke>>();
        let deadTurtles = new Array<QueueTree<CanvasStroke>>();

        for (let i = 0; i < this.animationQueues.length; i++) {
            let stroke = this.animationQueues[i].dequeue();
            if (stroke) {
                ret.push(stroke);
            } else {
                // this.queueSuccession(this.animationQueues[i]);
                deadTurtles.push(this.animationQueues[i]);
            }
        }

        // this.queueSuccession(t);
        deadTurtles.forEach((deadTurtle) => {
            this.queueSuccession(deadTurtle);
        })
        // this.animationQueues.concat(newQueues);
        return ret;
    }
    private queueSuccession(q: QueueTree<CanvasStroke>) {
        let index = this.animationQueues.indexOf(q);
        // console.log(`${this.animationQueues.length} Turtles now...`);
        this.animationQueues.splice(index, 1);
        // delete this.animationQueues[index];
        // console.log(`Removing a turtle... ${this.animationQueues.length} turtles now...`);

        q.yieldChildren().forEach((queueTree) => {
            this.animationQueues.push(queueTree);
            // console.log(`adding a turtle... ${this.animationQueues.length}`);

        });
    }

    public static isIntialized(): boolean {
        return this.instance ? true : false;
    }
    public static Instance(ctx?: CanvasRenderingContext2D): Animator {
        if (this.instance) {
            return this.instance;
        } else if (ctx) {
            this.instance = new this(ctx);
            return this.instance;
        } else {
            throw new Error("Animator must be initialized with a CanvasRenderingContext2D");
        }
    }

}

class Turtle {
    // private static AnimationManager: AnimationManager = new AnimationManager();
    private static drawTurtles: boolean = true;
    static hide = () => {
        Turtle.drawTurtles = false;
    }
    static show = () => {
        Turtle.drawTurtles = true;
    }

    private strokeQueue: QueueTree<CanvasStroke>;

    /**
     * The x coordinate of the Turtle
     */
    private x: number;
    /**
     * The y coordinate of the Turtle
     */
    private y: number;
    /**
     * Angle, in radians, that the turtle is facing
     */
    private angle: number = (Math.PI / 2); // radians

    private drawing: boolean = true;
    private pen: Pen = {
        color: "black",
        width: 2
    }
    /**
     * The speed of the turtle. Set to 0 for the turtle to draw instantly.
     */
    speed: number = 10; // *10 px/second? 0 == inf
    private ctx: CanvasRenderingContext2D;

    constructor(x?: number | Turtle, y?: number, angle?: number, canvas?: HTMLCanvasElement, ) {
        if (x) {
            if (typeof (x) != "number") {
                this.strokeQueue = new QueueTree<CanvasStroke>();
                x.strokeQueue.addChild(this.strokeQueue);

                this.ctx = x.ctx;
                this.x = x.x;
                this.y = x.y;
                this.angle = x.angle;
                this.speed = x.speed;
                this.pen = x.pen;

                // the strokeQueue is already registered w/ the animator
            }
        } else {
            this.strokeQueue = new QueueTree<CanvasStroke>();

            if (canvas) {
                this.ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
            } else {
                canvas = <HTMLCanvasElement>document.getElementById('turtleCanvas');
                this.ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
            }

            // if (Turtle.AnimationManager.ctx == null) {
            //     Turtle.AnimationManager.setContext(this.ctx);
            // }

            this.x = (x != undefined) ? x : Math.round(canvas.width / 2);
            this.y = (y != undefined) ? y : Math.round(canvas.height / 2);

            // register the turtle with the Animator
            Animator.Instance(this.ctx).addTurtleAnimationQueue(this.strokeQueue);
        }

    }


    /**
     * Creates a new turtle at the specified coordinates, or with the same
     * location / orientation of the parent if no coordinates are given.
     * @param x 
     * @param y 
     * @param angle 
     */
    // protected newTurtle(x?: number, y?: number, speed?: number, angle?: number): Turtle {
    //     let babyTurtle = new Turtle(
    //         x ? x : this.x,
    //         y ? y : this.y,
    //         angle ? angle : this.angle,
    //         this.ctx.canvas);

    //     babyTurtle.speed = speed ? speed : this.speed;
    //     babyTurtle.angle = angle ? angle : this.angle;

    //     return babyTurtle;
    // }

    /**
     * Creates a 'family' of new turtles at the same location and angle
     * of the parent turtle.
     * @param n The number of turtles to produce
     */
    // newTurtles(n: number): Array<this> {
    //     let ret: Array<this> = [];

    //     for (let i = 0; i < n; i++) {
    //         ret.push(this.newTurtle());
    //     }

    //     return ret;
    // }

    /**
     * Lifts the turtle's drawing pen.
     */
    penUp() {
        this.drawing = false;
    }
    /**
     * Lowers the turtle's drawing pen.
     */
    penDown() {
        this.drawing = true;
    }

    penColor(color: string) {
        this.pen.color = color;
    }
    penWidth(width: number) {
        this.pen.width = width;
    }
    /**
     * @param distance The distance, in pixels, to move.
     */
    move(distance: number): void {
        // console.log("moving a turtle...");
        let dx = Math.cos(this.angle) * distance;
        let dy = Math.sin(this.angle) * distance;

        if (this.drawing) {
            // this.draw(dx, dy, this.moveTime(distance));
            let strokes = this.getStrokes(
                this.x,
                this.y,
                this.x + dx,
                this.y + dy,
                this.moveAnimationFrameCount(distance));
            strokes.forEach(stroke => {
                // Turtle.AnimationManager.frames.enqueue([stroke]);
                // console.log(`Enqueuing a stroke.`);
                this.strokeQueue.enqueue(stroke);
            });


            // Turtle.AnimationManager.animate();
        }

        this.x += dx;
        this.y += dy;

    }

    private getStrokes(
        initX: number,
        initY: number,
        finalX: number,
        finalY: number,
        frameCount: number
    ): Array<CanvasStroke> {
        let dx = (finalX - initX) / frameCount;
        let dy = (finalY - initY) / frameCount;

        let runningX = initX;
        let runningY = initY;

        let ret = new Array<CanvasStroke>();

        let count = 1;

        while (count < frameCount) {
            ret.push({
                initX: runningX,
                initY: runningY,
                finalX: runningX + dx,
                finalY: runningY + dy,
                angle: this.angle,
                pen: {
                    width: this.pen.width,
                    color: this.pen.color
                }

            });

            count++;
            runningX += dx;
            runningY += dy;
        }

        ret.push({
            initX: runningX - dx,
            initY: runningY - dy,
            finalX: finalX,
            finalY: finalY,
            angle: this.angle,
            pen: {
                width: this.pen.width,
                color: this.pen.color
            }
        })

        return ret;
    }

    /**
     * Turn the turtle to the left.
     * @param fraction The fraction of a whole turn that the turtle will turn
     */
    turnLeft(fraction: number): void {
        this.turnLeftDeg(fraction * 360);
    }
    turnRight(fraction: number): void {
        this.turnRightDeg(fraction * 360);
    }
    private turnLeftDeg(degrees: number): void {
        this.angle -= degreesToRadians(degrees);
        this.normalizeAngle();
    }
    private turnRightDeg(degrees: number): void {
        this.angle += degreesToRadians(degrees);
        this.normalizeAngle();
    }

    /**
     * Returns the length of time in seconds for a 'move' command
     * @param distance The distance in pixels of the movement
     */
    private moveTime(distance: number): number {
        if (this.speed === 0) {
            return 0;
        } else {
            let ret = distance / (10 * this.speed)
            // console.log(`This line will take: ${ret} seconds`);
            return ret;
        }
    }

    /**
     * Returns the number of steps that a turtle's move operation will take,
     * depending on the distance and the turtle's current speed.
     * @param distance The distance in pixels of the movement
     */
    private moveAnimationFrameCount(distance: number): number {
        let time: number = this.moveTime(distance);
        if (time === 0) {
            return 1; // do the animation in one step
        } else {
            return Math.floor(this.moveTime(distance) / 0.016); // requestAnimationFrame
        }
    }

    private normalizeAngle(): void {
        //this.moveAnimationFrameCount(0); // should I animate the turning Turtle?

        while (this.angle >= 2 * Math.PI) {
            this.angle -= 2 * Math.PI;
        }
        while (this.angle < 0) {
            this.angle += 2 * Math.PI;
        }
    }
}

function degreesToRadians(degrees: number): number {
    return degrees * Math.PI / 180;
}

// export default Turtle;