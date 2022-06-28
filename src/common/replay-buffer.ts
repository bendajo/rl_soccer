import {Batch} from "./batch";

export class ReplayBuffer {
    public readonly maxSize: number;
    public filledTo: number;
    private buffer: Batch[];
    private nextId: number;


    constructor(size: number = 100) {
        this.buffer = new Array(size);
        this.filledTo = 0;
        this.nextId = 0;
        this.maxSize = size;
    }

    storeExperience(data: Batch) {
        this.buffer[this.nextId] = data;
        if (this.nextId < this.maxSize && this.filledTo < this.maxSize - 1) {
            this.filledTo = this.nextId;
        }
        this.nextId = (this.nextId + 1) % this.maxSize;
    }

    getExperience(batchSize: number) {
        batchSize = batchSize > this.filledTo ? this.filledTo : batchSize;
        const indexes: number[] = this.getIndexes(batchSize);
        const batches: Batch[] = [];

        indexes.forEach(index => {
           batches.push(this.buffer[index]);
        });

        return batches;
    }

    filled() {
        return this.filledTo == this.maxSize - 1;
    }

    getIndexes(batchSize: number): number[] {
        const indexes: number[] = [];
        for (let i = 0; i < batchSize; i++) {
            let index = Math.floor(Math.random() * this.filledTo);
            indexes.push(index)
        }
        return indexes;
    }

    clearBuffer() {
        this.buffer = new Array(this.maxSize);
        this.filledTo = 0;
        this.nextId = 0;
    }

}