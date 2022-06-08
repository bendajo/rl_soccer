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
import {nextFrame} from "@tensorflow/tfjs";

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

    private objectLoaderService: ObjectLoaderService;
    private playerControlService: PlayerControlService;


    public start(): void {
        this.init()
        this.playerControlService.playerControl();
        // this.playerControlService.playerControl2(this.teamB.players[0]);
        let counter = 0;
        console.log("TEst2");
        const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
        const train = async function(player: Player) {
            console.log("TEst");
            while(true) {
                player.moveRight();
                console.log("TEst");
                await nextFrame();
            }
        }
        window.train = train;
        const loop = () => {
            this.renderer.render(this.scene, this.camera);
            this.teamA.animate(this.ball);
            this.teamB.animate(this.ball);
            this.ball.animate();
            this.checkForGoal();
            if (this.teamA.score == 5 || this.teamB.score == 5) {
                console.log("Game Over");
                return this.teamA.score > this.teamB.score ? this.teamA : this.teamB;
            }
            window.requestAnimationFrame(loop);
        }


        loop();
    }

    // loop() {
    //     // counter++;
    //     // console.log(counter);
    // }
    //
    // step() {
    //     this.renderer.render(this.scene, this.camera);
    //     this.teamA.animate(this.ball);
    //     this.teamB.animate(this.ball);
    //     this.ball.animate();
    //     this.checkForGoal();
    //     if (this.teamA.score == 5 || this.teamB.score == 5) {
    //         console.log("Game Over");
    //         return this.teamA.score > this.teamB.score ? this.teamA : this.teamB;
    //     }
    // }

    public getState(player: Player): any[] {
        return [...player.getState(), ...this.teamA.getState(player), ...this.teamB.getState(), ...this.ball.getState()];
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
        this.teamA = new Team(0, "#8d0000", this.scene, 2);
        this.teamB = new Team(1, "#0014bb", this.scene, 0);
        const ballSphere = new SphereGeometry(0.25, 32, 16);
        const ballMaterial = new MeshBasicMaterial({color: 0xffff00});
        this.ball = new Ball(ballSphere, ballMaterial);
        this.ball.position.y = 1;
        this.ball.position.set(0, 0.5, 0);
        this.scene.add(this.ball);
        this.setWindowObjects();
    }

    private initLight() {
        this.scene.add(new AmbientLight(0xffffff, 0.6));
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
            this.resetAfterGoal();
        }

        if (homeGoalArea.containsBox(ballBox)) {
            console.log("AWAY GOAL");
            this.teamB.goalScored();
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
    }

}