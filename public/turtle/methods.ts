function polygon(sides: number, sideLength: number) {
    let count = 0;
    while (count < sides) {
        count++;
        this.move(sideLength);
        this.turnLeft(1 / sides);
    }
}