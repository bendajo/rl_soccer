import {Player} from "../game/player";
import {
    buffer,
    dispose,
    losses,
    nextFrame,
    oneHot,
    Optimizer, scalar,
    Sequential, Tensor,
    tensor1d,
    tidy,
    train,
    variableGrads
} from "@tensorflow/tfjs";
import {copyWeights, DQN} from "./dqn";
import {ReplayBuffer} from "../common/replay-buffer";
import {Game} from "../game/game";
import {Batch} from "../common/batch";
import {MovingAverager} from "../common/MovingAverager";

export class DQNAgent {
    private player: Player;
    private game: Game;
    private dqn: DQN;
    private onlineNN: Sequential;
    private targetNN: Sequential;
    private epsilonFinal = 0.99;
    private epsilonDecay = 0.00001; //0.00001
    private learningRate = 0.001;
    private epsilon = 0;
    private totalReward;
    private optimizer;
    private replayBuffer: ReplayBuffer;
    private stopTraining: boolean;

    constructor(player: Player, game: Game) {
        this.player = player;
        this.game = game;
        this.dqn = new DQN();
        this.onlineNN = this.dqn.createDQN();
        this.targetNN = this.dqn.createDQN();
        this.targetNN.trainable = false;
        this.optimizer = train.adam(this.learningRate);
        this.replayBuffer = new ReplayBuffer();
        this.totalReward = 0;
        this.stopTraining = false;
    }

    getRandomAction() {
        const actionSpaceLength = this.player.getActions().length - 1;
        const id = Math.floor(Math.random() * (actionSpaceLength * 25 + 1))
        return this.player.getActions()[id % 5];
    }

    playStep() {
        if (this.replayBuffer.filled()) {
            this.epsilon = this.epsilon < this.epsilonFinal ? this.epsilon + this.epsilonDecay : this.epsilonFinal;
        }
        let action;
        if (Math.random() > this.epsilon) {
            action = this.getRandomAction();
        } else {
            tidy(() => {
                const stateTensor: Tensor = this.game.getStateTensor(this.player);
                let t = this.onlineNN.predict([stateTensor]);
                if (Array.isArray(t)) {
                    t = t[0];
                }

                action = this.player.getActions()[t.argMax(-1).dataSync()[0]];
            });
        }
        const stuff: Batch = this.game.step(this.player, action);
        this.replayBuffer.storeExperience(stuff);
        this.totalReward += <number>stuff.reward;

        stuff.reward = this.totalReward;
        return stuff;
    }

    trainOnReplayBuffer(batchSize: number, gamma: number, optimizer: Optimizer) {
        const batch = this.replayBuffer.getExperience(batchSize);
        const lossFunction = () => tidy(() => {
            const stateTensor = batch.map(b => b.state);
            const actionTensor = tensor1d(batch.map(b => b.action), 'int32');

            const online = this.onlineNN.apply(stateTensor, {training: true});
            const _oneHot = oneHot(actionTensor, this.player.getActions().length);
            // @ts-ignore
            const qs = online.mul(_oneHot).sum(-1);

            const rewardTensor = tensor1d(batch.map(b => b.reward));
            const nextStateTensor = batch.map(b => b.nextState);
            const nextMaxQTensor = (<Tensor>this.targetNN.predict(nextStateTensor)).max(-1);
            const doneMask = scalar(1).sub(tensor1d(batch.map(b => b.terminated)).asType('float32'));
            const targetQs = rewardTensor.add(nextMaxQTensor.mul(doneMask).mul(gamma));
            return losses.meanSquaredError(targetQs, qs);
        });
        // @ts-ignore
        const grads = variableGrads(lossFunction);
        // Use the gradients to update the online DQN's weights.
        optimizer.applyGradients(grads.grads);
        dispose(grads);
    }


    async train(batchSize: number, gamma: number, learningRate: number, rewardThreshold: number, syncEveryFrames: number, savePath: string) {
        let frameCount = 0;


        for (let i = 0; i < this.replayBuffer.maxSize; i++) {
            this.playStep();
            await nextFrame();
        }

        const rewardAverager = new MovingAverager();
        const _optimizer = train.adam(learningRate);
        let averageRewardBest = -Infinity;

        while (true) {
            this.trainOnReplayBuffer(batchSize, gamma, _optimizer);
            const batch: Batch = this.playStep();
            console.log("Info", this.totalReward, batch.reward, this.epsilon);
            if (batch.terminated || this.epsilon >= 0.999 || this.game.terminated == true) {
                rewardAverager.append(batch.reward);
                const averageReward = rewardAverager.average();
                this.printStats();
                if (averageReward >= rewardThreshold || this.epsilon >= 0.999 || this.game.terminated == true) {
                    this.saveNetwork();
                    break;
                }
                if (averageReward > averageRewardBest) {
                    averageRewardBest = averageReward;
                    this.saveNetwork();
                    break;
                }
            }
            frameCount++;
            if (frameCount == syncEveryFrames) {
                frameCount = 0;
                copyWeights(this.targetNN, this.onlineNN);
                console.log("Weights synced");
            }
            await nextFrame();
        }
    }

    printStats() {
        console.log("WOW", this.epsilon);
    }

    async saveNetwork() {
        console.log("saving");
        await this.onlineNN.save('downloads://model_' + this.getModelName());
    }

    getModelName() {
        return this.player.teamId + "_" + this.player.identifier + "_" + new Date().getTime();
    }

}