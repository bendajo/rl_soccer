// @ts-nocheck
import {Player} from "../game/player";
import {nextFrame} from "@tensorflow/tfjs";
import {DQN} from "./dqn";

export class DQNAgent {
    private dqn: DQN;
    private network;
    private epsilon = 0.99;

    constructor(player: Player) {
        this.player = player;
        this.dqn = new DQN();
        this.network = this.dqn.createDQN();
    }

    chooseAction(state) {
        return 0;
    }


    async train(batch = []) {
        this.stopTraining = false;
        let loss = 0;

        while (true) {
            this.player.moveRight();
            await nextFrame();
        }
        return loss;
    }
}