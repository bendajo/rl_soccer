import {layers, Sequential, sequential} from "@tensorflow/tfjs";

export class DQN {

    constructor() {
    }

    createDQN() {
        const model = sequential();
        // model.add(layers.dense())
        // model.add(layers.conv2d({
        //     filters: 128,
        //     kernelSize: 3,
        //     strides: 1,
        //     activation: 'relu',
        //     inputShape: [250, 450, 1]
        // }));
        model.add(layers.dense({units: 22, activation: 'relu', inputShape: [22, 1]}));
        model.add(layers.dense({units: 64, activation: 'relu'}));
        model.add(layers.dense({units: 256, activation: 'relu'}));
        // model.add(layers.batchNormalization());
        // model.add(layers.conv2d({
        //     filters: 256,
        //     kernelSize: 3,
        //     strides: 1,
        //     activation: 'relu'
        // }));
        // model.add(layers.batchNormalization());
        // model.add(layers.conv2d({
        //     filters: 256,
        //     kernelSize: 3,
        //     strides: 1,
        //     activation: 'relu'
        // }));
        // model.add(layers.dense({units: 256, activation: 'relu'}));
        model.add(layers.flatten());
        // model.add(layers.dropout({rate: 0.25}));
        model.add(layers.dense({units: 5}));
        return model;
    }
}

export function copyWeights(sourceNN: Sequential, destNN: Sequential) {
    let originalDestNetworkTrainable;
    if (destNN.trainable !== sourceNN.trainable) {
        originalDestNetworkTrainable = destNN.trainable;
        destNN.trainable = sourceNN.trainable;
    }
    destNN.setWeights(sourceNN.getWeights());
    if (originalDestNetworkTrainable != null) {
        destNN.trainable = originalDestNetworkTrainable;
    }
}