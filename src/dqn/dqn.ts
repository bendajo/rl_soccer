import {layers, sequential} from "@tensorflow/tfjs";

export class DQN {

    constructor() {
    }

    createDQN() {
        const model = sequential();
        // model.add(layers.dense())
        model.add(layers.conv2d({
            filters: 128,
            kernelSize: 3,
            strides: 1,
            activation: 'relu',
            inputShape: [32, 32, 2]
        }));
        model.add(layers.batchNormalization());
        model.add(layers.conv2d({
            filters: 256,
            kernelSize: 3,
            strides: 1,
            activation: 'relu'
        }));
        model.add(layers.batchNormalization());
        model.add(layers.conv2d({
            filters: 256,
            kernelSize: 3,
            strides: 1,
            activation: 'relu'
        }));
        model.add(layers.flatten());
        model.add(layers.dense({units: 100, activation: 'relu'}));
        model.add(layers.dropout({rate: 0.25}));
        model.add(layers.dense({units: 1}));
        return model;
    }

}