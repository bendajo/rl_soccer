import {BoxGeometry, Mesh, MeshBasicMaterial, Vector3} from "three";
import {Ball} from "./ball";
import {fieldHeight, fieldWidth} from "./constants";
const tf = require("@tensorflow/tfjs");
export class Player extends Mesh {
    identifier: number;
    teamId: number;
    basePosition: Vector3;
    speed: number;
    isMoving: boolean;
    right: boolean;
    left: boolean;
    upd: boolean; //up
    down: boolean;
    ball: Ball;
    reward: number;

    constructor(identifier: number, teamId: number, geometry: BoxGeometry, material: MeshBasicMaterial, basePosition: Vector3, speed: number = 0.1) {
        super(geometry, material);
        this.identifier = identifier;
        this.teamId = teamId;
        this.speed = speed;
        this.basePosition = basePosition;
        this.position.set(basePosition.x, basePosition.y, basePosition.z);
        this.reward = 0;
    }

    shootBall() {
        if (this.ball) {
            this.ball.shootBall();
        }
    }

    moveUp(){
        this.upd = true;
        this.down = false;
        this.left = false;
        this.right = false;
        if (!this.outOfBoundsZUp()) {
            this.position.z -= this.speed;
        } else {
            this.position.z = -(fieldHeight / 2) + 0.4;
        }
    }

    moveDown(){
        this.down = true;
        this.upd = false;
        this.left = false;
        this.right = false;
        if (!this.outOfBoundsZDown()) {
            this.position.z += this.speed;
        } else {
            this.position.z = (fieldHeight / 2) - 0.4;
        }
    }

    moveLeft(){
        this.left = true;
        this.upd = false;
        this.down = false;
        this.right = false;
        if (!this.outOfBoundsXLeft()) {
            this.position.x -= this.speed;
        } else {
            this.position.x = -(fieldWidth / 2) + 0.4;
        }
    }

    moveRight(){
        this.right = true;
        this.upd = false;
        this.down = false;
        this.left = false;
        if (!this.outOfBoundsXRight()) {
            this.position.x += this.speed;
        } else {
            this.position.x = (fieldWidth / 2) - 0.4;
        }
    }

    animate(ball: Ball){
        this.isMoving = this.upd || this.down || this.left || this.right;
        if(this.upd) {
            this.moveUp()
        }
        if(this.down) {
            this.moveDown()
        }
        if(this.left) {
            this.moveLeft()
        }
        if(this.right) {
            this.moveRight()
        }
        //only if the ball is near the player and he is running he can get the ball:
        if(this.position.distanceTo(ball.position) <= 0.8) {
            if(ball.attachedPlayer == null || (ball.attachedPlayer.identifier != this.identifier && ball.attachedPlayer.teamId != this.teamId)) {
                if(ball.attachedPlayer) {
                    ball.attachedPlayer.addReward(-5);
                    this.addReward(5);
                    ball.attachedPlayer.ball = null;
                }
                ball.attachedPlayer = this;
                if (ball.shotFrom != null) {
                    if (ball.shotFrom.teamId == ball.attachedPlayer.teamId) {
                        ball.shotFrom.addReward(2);
                        ball.attachedPlayer.addReward(2);
                    } else {
                        ball.shotFrom.addReward(-2);
                        ball.attachedPlayer.addReward(1);
                    }
                } else {

                    ball.attachedPlayer.addReward(1);
                }
                ball.shotFrom = null;
                this.ball = ball;
            }
        }
    }

    addReward(reward: number) {
        this.reward += reward;
    }

    outOfBoundsXLeft(): boolean {
        return this.position.x < -(fieldWidth / 2) + 0.5;
    }

    outOfBoundsXRight(): boolean {
        return this.position.x > (fieldWidth / 2) - 0.5;
    }

    outOfBoundsZUp(): boolean {
        return this.position.z < -(fieldHeight / 2) + 0.5;
    }

    outOfBoundsZDown(): boolean {
        return this.position.z > (fieldHeight / 2) - 0.5;
    }

    resetPlayer() {
        this.position.set(this.basePosition.x, this.basePosition.y, this.basePosition.z);
        this.ball = null;
    }

    getState(): any[] {
        return [this.position.x, this.position.z];
    }


    getActions(): number[] {
        return [0, 1, 2, 3, 4];
    }

    getPosition(): number[] {
        const x = Math.round(this.position.x * 10);
        const z = Math.round(this.position.z * 10);
        return [z, x];
    }

    step(action: any): number {
        switch(action) {
            case 0:
                this.moveLeft();
                break;
            case 1:
                this.moveRight();
                break;
            case 2:
                this.moveUp();
                break;
            case 3:
                this.moveDown();
                break;
            case 4:
                if (this.ball != null) {
                    this.shootBall();
                } else {
                    this.doRandomAction();
                }
                break;
        }
        const returnReward = this.reward;
        this.reward = 0;
        return returnReward;
    }

    doRandomAction(includeShooting: boolean = true) {
        const actionSpaceLength = this.getActions().length - (includeShooting ? 0 : 1);

        switch(Math.floor(Math.random() * actionSpaceLength)) {
            case 0:
                this.moveLeft();
                break;
            case 1:
                this.moveRight();
                break;
            case 2:
                this.moveUp();
                break;
            case 3:
                this.moveDown();
            case 4:
                this.shootBall();
                break;
        }
    }
}