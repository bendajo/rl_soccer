export class MovingAverager {
    private buffer: number[];
    constructor(bufferLength: number = 100) {
        this.buffer = new Array(100).fill(null);
    }
    append(x: number) {
        this.buffer.shift();
        this.buffer.push(x);
    }

    average() {
        return this.buffer.reduce((x, prev) => x + prev) / this.buffer.length;
    }
}