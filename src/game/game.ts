import {Team} from "./team";
import {Ball} from "./ball";
import {
    AmbientLight, Box3,
    BoxBufferGeometry, BoxGeometry,
    DirectionalLight, MathUtils,
    Mesh, MeshBasicMaterial,
    MeshNormalMaterial,
    OrthographicCamera, PCFSoftShadowMap,
    Scene, SphereGeometry, Vector3,
    WebGLRenderer
} from "three";
import {ObjectLoaderService} from "./services/objectLoaderService";
import {PlayerControlService} from "./services/playerControlService";
import {fieldHeight, fieldWidth} from "./constants";
import {Player} from "./player";
import {nextFrame, Tensor, buffer, tensor} from "@tensorflow/tfjs";
import {Batch} from "../common/batch";

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

export class Game {
    scene: Scene;
    camera: OrthographicCamera;
    pitch: Mesh;
    renderer: WebGLRenderer;
    teamA: Team;
    teamB: Team;
    ball: Ball;
    scoreDiv: Element;
    terminated: boolean;

    private objectLoaderService: ObjectLoaderService;
    private playerControlService: PlayerControlService;


    public start(): void {
        this.init()
        this.playerControlService.playerControl();
        let counter = 0;
        const loop = () => {
            this.renderer.render(this.scene, this.camera);
            this.teamA.animate(this.ball);
            this.teamB.animate(this.ball);
            this.teamB.playRandom();
            this.ball.animate();
            this.checkForGoal();
            if (this.teamA.score == 3 || this.teamB.score == 3 || counter >= 100000) {
                console.log("Game Over");
                this.terminated = true;
                return this.teamA.score > this.teamB.score ? this.teamA : this.teamB;
            }
            counter++;
            window.requestAnimationFrame(loop);
        }


        loop();
    }


    public getState(player: Player): number[] {
        return [...player.getState(), ...this.teamA.getState(player), ...this.teamB.getState(), ...this.ball.getState()];
    }

    public getFullState(player: Player): Tensor {
        // 0 = nothing
        // 1 = Player
        // 2 = teammate
        // 3 = ball
        // 4 = opponent
        // Field is 450 * 250 (approximately)

        const width = 450, height = 250;
        const field = buffer([1, 250, 450]);

        // for (let i = 0; i < height; i++) {
        //     field[i] = new Array(width).fill(0);
        // }
        let teamAPlayers = this.teamA.players;
        if (player != null) {
            const playerPos = player.getPosition();
            field.set(1, 1, playerPos[0] + (height / 2),playerPos[1] + (width / 2));
            // field[playerPos[0] + (height / 2)][playerPos[1] + (width / 2)] = 1;

            teamAPlayers = teamAPlayers.filter((_player: Player) => _player.identifier !== player.identifier);
        }
        teamAPlayers.forEach((p: Player) => {
            const playerPos = p.getPosition();
            field.set(2, 1, playerPos[0] + (height / 2),playerPos[1] + (width / 2));
            // field[playerPos[0] + (height / 2)][playerPos[1] + (width / 2)] = 2;
        });

        const ballPos = this.ball.getPosition();
        field.set(3, 1, ballPos[0] + (height / 2),ballPos[1] + (width / 2));
        // field[ballPos[0] + (height / 2)][ballPos[1] + (width / 2)] = 3;

        this.teamB.players.forEach((p: Player) => {
            const playerPos = p.getPosition();
            field.set(4, 1, playerPos[0] + (height / 2),playerPos[1] + (width / 2));
            // field[playerPos[0] + (height / 2)][playerPos[1] + (width / 2)] = 4;
        });
        return field.toTensor();
    }

    public getStateTensor(player: Player): Tensor {
        const state = this.getState(player);
        const tfbuffer = buffer([22]);
        for (let i = 0; i < state.length; i++) {
            tfbuffer.set(i, state[i]);
        }
        return tfbuffer.toTensor();

    }

    public step(player: Player, action: number): Batch {
        const batch = new Batch();
        batch.state = this.getFullState(player);
        batch.reward = player.step(action)
        batch.action = action;
        batch.nextState = this.getFullState(player);
        batch.terminated = this.terminated ? 1 : 0;
        return batch;
    }

    private init() {
        this.objectLoaderService = new ObjectLoaderService();
        this.playerControlService = new PlayerControlService();

        this.scene = new Scene();
        this.initCamera();
        this.initRenderer();
        this.initPitch();
        this.initGame();
        this.initLight();
        this.initResizeListener();
        this.initScores();
    }

    private initCamera() {
        const aspect = window.innerWidth / window.innerHeight;
        const d = 20;
        this.camera = new OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
        this.camera.position.set(0, 20, 0);
        this.camera.lookAt(this.scene.position);
        this.scene.add(this.camera);
    }

    private initRenderer() {
        this.renderer = new WebGLRenderer({
            canvas: document.querySelector('.webgl')
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(sizes.width, sizes.height);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = PCFSoftShadowMap;
    }

    private initPitch() {
        this.pitch = new Mesh(new BoxBufferGeometry(fieldWidth, 1, fieldHeight), new MeshBasicMaterial({color: 0x00be00}));
        this.pitch.receiveShadow = true;
        this.scene.add(this.pitch);

        this.objectLoaderService.loadObject("./models/goal/scene",
            this.scene,
            new Vector3(0.01, 0.01, 0.01),
            new Vector3(0, MathUtils.degToRad(-90), 0),
            new Vector3(-20.7, 0.5, -2.5));
        this.objectLoaderService.loadObject("./models/goal/scene",
            this.scene,
            new Vector3(0.01, 0.01, 0.01),
            new Vector3(0, MathUtils.degToRad(90), 0),
            new Vector3(20.7, 0.5, 2.5));
    }

    private initGame() {
        this.terminated = false;
        this.teamA = new Team(0, "#8d0000", this.scene, 5);
        this.teamB = new Team(1, "#0014bb", this.scene, 5);
        const ballSphere = new SphereGeometry(0.25, 32, 16);
        const ballMaterial = new MeshBasicMaterial({color: 0xffff00});
        this.ball = new Ball(ballSphere, ballMaterial);
        this.ball.position.y = 1;
        this.ball.position.set(0, 0.5, 0);
        this.scene.add(this.ball);
        this.setWindowObjects();
    }

    private initLight() {
        this.scene.add(new DirectionalLight(0xffffff, 0.6));
        const directionalLight = new DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(200, 500, 300);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
    }

    private initResizeListener() {
        window.addEventListener('resize', () => {
            // Save sizes
            sizes.width = window.innerWidth;
            sizes.height = window.innerHeight;

            // Update camera
            const d = 20;
            const aspect = window.innerWidth / window.innerHeight;
            this.camera.left = -d * aspect;
            this.camera.right = d * aspect;
            this.camera.updateProjectionMatrix()

            // Update renderer
            this.renderer.setSize(sizes.width, sizes.height)
        });
    }

    // Display Score
    private initScores() {
        this.scoreDiv = document.getElementById("score");
    }

    private setWindowObjects() {
        window.selectedPlayer = this.teamA.players[0];
        window.homeTeam = this.teamA;
        window.awayTeam = this.teamB;
        // const urlParams = new URLSearchParams(window.location.search);
        // return urlParams.get('player') != '' ? parseInt(urlParams.get('player')) : null;
    }

    private checkForGoal() {
        const homeGoalMesh = new Mesh(new BoxGeometry(1.5, 10, 5), new MeshNormalMaterial());
        homeGoalMesh.position.set(-20.7, 0.5, 0);
        const homeGoalArea = new Box3().setFromObject(homeGoalMesh);

        const awayGoalMesh = new Mesh(new BoxGeometry(1.5, 10, 5), new MeshNormalMaterial());
        awayGoalMesh.position.set(20.7, 0.5, 0);
        const awayGoalArea = new Box3().setFromObject(awayGoalMesh);

        const ballBox = new Box3().setFromObject(this.ball);

        if (awayGoalArea.containsBox(ballBox)) {
            console.log("HOME GOAL");
            this.teamA.goalScored();
            this.teamA.players.forEach(p => p.addReward(5))
            if (this.ball.attachedPlayer != null) {
                this.ball.attachedPlayer.addReward(10);
            } else if (this.ball.shotFrom != null) {
                this.ball.shotFrom.addReward(10);
            }
            this.resetAfterGoal();
        }

        if (homeGoalArea.containsBox(ballBox)) {
            console.log("AWAY GOAL");
            this.teamB.goalScored();
            this.teamA.players.forEach(p => p.addReward(-5))
            this.resetAfterGoal();
        }
        this.scoreDiv.innerHTML = this.teamA.score + " : " + this.teamB.score;
    }

    private resetAfterGoal() {
        if (this.ball.attachedPlayer != null) {
            this.ball.attachedPlayer.ball = null;
            this.ball.attachedPlayer = null;
        }
        this.ball.targetPosition = null;
        this.ball.position.set(0, 1, 0);
        this.teamA.resetPlayers();
        this.teamB.resetPlayers();
    }

    private resetMatch() {
        this.teamA.score = 0;
        this.teamB.score = 0;
        this.ball.attachedPlayer = null;
        this.ball.position.set(0, 1, 0);
        this.teamA.resetPlayers();
        this.teamB.resetPlayers();
        this.terminated = false;
    }

}