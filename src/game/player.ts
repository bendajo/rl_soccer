import {BoxGeometry, Mesh, MeshBasicMaterial, Vector3} from "three";
import {Ball} from "./ball";
import {fieldHeight, fieldWidth} from "./constants";
const tf = require("@tensorflow/tfjs");
export class Player extends Mesh {
    identifier: number;
    basePosition: Vector3;
    speed: number;
    isMoving: boolean;
    right: boolean;
    left: boolean;
    upd: boolean; //up
    down: boolean;
    ball: Ball;

    constructor(identifier: number, geometry: BoxGeometry, material: MeshBasicMaterial, basePosition: Vector3, speed: number = 0.05) {
        super(geometry, material);
        this.identifier = identifier;
        this.speed = speed;
        this.basePosition = basePosition;
        this.position.set(basePosition.x, basePosition.y, basePosition.z);
    }

    shootBall() {
        if (this.ball) {
            this.ball.shootBall();
        }
    }

    moveUp(){
        if (!this.outOfBoundsZUp()) {
            this.position.z -= this.speed;
        } else {
            this.position.z = -(fieldHeight / 2) + 0.4;
        }
    }

    moveDown(){
        if (!this.outOfBoundsZDown()) {
            this.position.z += this.speed;
        } else {
            this.position.z = (fieldHeight / 2) - 0.4;
        }
    }

    moveLeft(){
        if (!this.outOfBoundsXLeft()) {
            this.position.x -= this.speed;
        } else {
            this.position.x = -(fieldWidth / 2) + 0.4;
        }
    }

    moveRight(){
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
        if(this.position.distanceTo(ball.position) <= 0.5) {
            if(ball.attachedPlayer != this){
                if(ball.attachedPlayer){
                    ball.attachedPlayer.ball = null;
                }
                ball.attachedPlayer = this;
                // TODO: send reward
                ball.shotFrom = null;
                this.ball = ball;
            }
        }
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


    getAction() {
        let actions = ['left', 'right', 'up', 'down'];
        if (this.ball != null) {
            actions = [...actions, 'shoot'];
        }
        return actions;
    }

    step(action: any) {
        switch(action) {
            case 'left':
                this.moveLeft();
                break;
            case 'right':
                this.moveRight();
                break;
            case 'up':
                this.moveUp();
                break;
            case 'down':
                this.moveDown();
                break;
            case 'shoot':
                this.shootBall();
                break;
        }
    }

    train() {
    }
}