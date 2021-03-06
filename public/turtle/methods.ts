function polygon(sides: number, sideLength: number) {
    let count = 0;
    while (count < sides) {
        count++;
        this.move(sideLength);
        this.turnLeft(1 / sides);
    }
}

function branch(length: number) {
    if (length < 10) {
        return;
    }

    this.penColor('brown');
    this.penWidth(length / 10);

    this.move(length / 2);
    this.turnRight(1 / 50);
    this.move(length / 2);

    let left = new Turtle(this);
    left.turnLeft(1 / 8);
    left.branch(length * .75);

    let right = new Turtle(this);
    right.turnRight(1 / 12);
    right.branch(length * .75);
}

function randBranch(length: number) {
    if (length < 10) {
        return;
    }

    this.penColor('brown');
    this.penWidth(length / 10);

    this.move(about(length / 2));
    this.turnRight(1 / 50);
    this.move(about(length / 2));

    let left = new TreeTurtle(this);
    left.turnLeft(about(1 / 8));
    left.branch(about(length * .75));

    let right = new TreeTurtle(this);
    right.turnRight(about(1 / 12));
    right.branch(about(length * .75));
}


function about(n: number) {
    return n * 1 * (1.5 - Math.random());
}