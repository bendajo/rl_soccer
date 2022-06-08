import {Player} from "./player";
import {BoxBufferGeometry, MeshLambertMaterial, Scene, Vector3} from "three";
import {Ball} from "./ball";
import {fiveOnFive} from "./constants";


export class Team {
    id: number;
    color: string;
    players: Player[];
    size: number;
    score: number;

    constructor(id: number, color: string, scene: Scene, size: number = 5) {
        this.id = id;
        this.color = color;
        this.size = size;
        this.players = [];
        this.score = 0;
        this.buildTeam(scene);
    }


    getState(player: Player = null): any[] {
        let state: any[] = [];
        // Only filter player of homeTeam
        if (player != null && this.id == 0) {
            this.players = this.players.filter((_player: Player) => _player.identifier !== player.identifier);
        }
        this.players.forEach((p: Player) => {
            state = [...state, ...p.getState()];
        });
        return state;
    }


    buildTeam(scene: Scene) {
        for (let i = 0; i < this.size; i++) {
            const player = new Player(i,
                new BoxBufferGeometry(0.8, 2, 0.8),
                new MeshLambertMaterial({color:this.color}),
                new Vector3(fiveOnFive[this.id][i][0], 1, fiveOnFive[this.id][i][1]));
            this.players.push(player);
            player.castShadow = true;
            scene.add(player);
        }
    }

    goalScored() {
        this.score += 1;
    }

    animate(ball: Ball) {
        this.players.forEach(p => p.animate(ball));
    }

    resetPlayers() {
        this.players.forEach(p => p.resetPlayer());
    }
}