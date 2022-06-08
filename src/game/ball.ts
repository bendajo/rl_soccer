import {Matrix3, Mesh, MeshBasicMaterial, SphereGeometry, Vector3} from "three";
import {Player} from "./player";
import {Position} from "three/examples/jsm/utils/ShadowMapViewer";
import {fieldHeight, fieldWidth} from "./constants";

export class Ball extends Mesh {
    name: string;
    attachedPlayer: Player;
    target: Player;
    movingDirection: [number, number];
    previousMovingDirection: [number, number];
    targetPosition: Vector3;
    shootDistance: number;
    shootSpeed: number;
    shotFrom: Player;

    constructor(ballSphere: SphereGeometry, ballMaterial: MeshBasicMaterial, shootDistance = 9, shootSpeed = 20) {
        super(ballSphere, ballMaterial);
        this.movingDirection = [0, 0];
        this.previousMovingDirection = [0, 0];
        this.shootDistance = shootDistance;
        this.shootSpeed = shootSpeed;
    }

    getState(): any[] {
        return [this.position.x, this.position.z];
    }

    shootBall() {
        // Shoot Ball x into moving direction
        this.getPlayerDirection();
        const playerPosition = this.attachedPlayer.position.clone();
        // To stupid for vector math
        let targetX = playerPosition.x + (this.shootDistance * this.movingDirection[1]);
        let targetZ = playerPosition.z + (this.shootDistance * this.movingDirection[0]);

        if (this.outOfBoundsXLeft(targetX, targetZ)) {
            targetX = -(fieldWidth / 2);
        }
        if (this.outOfBoundsXRight(targetX, targetZ)) {
            targetX = (fieldWidth / 2);
        }

        if (this.outOfBoundsZDown(targetZ)) {
            targetZ = (fieldHeight / 2);
        }
        if (this.outOfBoundsZUp(targetZ)) {
            targetZ = -(fieldHeight / 2);
        }
        this.targetPosition = new Vector3(targetX, this.position.y, targetZ);
        // this.targetPosition.x = targetX;
        // this.targetPosition.z = targetZ;

        this.shotFrom = this.attachedPlayer;
        this.attachedPlayer.ball = null;
        this.attachedPlayer = null;

    }

    animate() {
        if(this.attachedPlayer != null && this.target == undefined) {
            this.getPlayerDirection();
            const movingDirection = this.attachedPlayer.position.clone();
            // offset the ball so the ball is in front of the player
            // let m = new Matrix3(1, 0, 1);
            // const dirVector = new Vector3().applyNormalMatrix();
            // movingDirection.add(dirVector.applyNormalMatrix());
            movingDirection.x += this.movingDirection[1];
            movingDirection.z += this.movingDirection[0];

            this.position.copy(movingDirection);
        }

        if(this.targetPosition != undefined){
            let difX = this.targetPosition.x - this.position.x;
            let difZ = this.targetPosition.z - this.position.z;
            this.translateX(difX/this.shootSpeed);
            this.translateZ(difZ/this.shootSpeed);
            if(this.targetPosition.distanceTo(this.position) <= 0.1){
                this.targetPosition = null;
            }
        }
    }

    private getPlayerDirection() {
        if (this.attachedPlayer.upd ||
            this.attachedPlayer.down ||
            this.attachedPlayer.right ||
            this.attachedPlayer.left) {
            if (this.attachedPlayer.upd) {
                this.movingDirection[0] = -1;
            }
            if (this.attachedPlayer.down) {
                this.movingDirection[0] = 1;
            }
            if (this.attachedPlayer.left) {
                this.movingDirection[1] = -1;
            }
            if (this.attachedPlayer.right) {
                this.movingDirection[1] = 1;
            }
            if (!this.attachedPlayer.upd && !this.attachedPlayer.down) {
                this.movingDirection[0] = 0;
            }
            if (!this.attachedPlayer.right && !this.attachedPlayer.left) {
                this.movingDirection[1] = 0;
            }
            this.previousMovingDirection = this.movingDirection;
        } else {
            this.movingDirection = this.previousMovingDirection;
        }
    }


    outOfBoundsXLeft(pos: number, posZ: number): boolean {
        return pos < -(fieldWidth / 2) && this.outOfGoalArea(posZ);
    }

    outOfBoundsXRight(pos: number, posZ: number): boolean {
        return pos > (fieldWidth / 2) && this.outOfGoalArea(posZ);
    }

    outOfGoalArea(pos: number): boolean {
        return pos > 2.5 || pos < -2.5;
    }

    outOfBoundsZUp(pos: number): boolean {
        return pos < -(fieldHeight / 2);
    }

    outOfBoundsZDown(pos: number): boolean {
        return pos > (fieldHeight / 2);
    }
}