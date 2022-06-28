import {Game} from "./game/game";
import {Player} from "./game/player";
import {Team} from "./game/team";
import {DQN} from "./dqn/dqn";
import {DQNAgent} from "./dqn/dqn-agent";


declare global {
    interface Window {
        selectedPlayer: Player,
        homeTeam: Team,
        awayTeam: Team,
        train: (player: Player) => any,
        game: Game;
    }
}

const game = new Game();
window.game = game;
game.start();
game.getFullState(game.teamA.players[0]);
const dqnAgent = new DQNAgent(game.teamA.players[0], game);
const dqnAgent1 = new DQNAgent(game.teamA.players[1], game);
const dqnAgent2 = new DQNAgent(game.teamA.players[2], game);
const dqnAgent3 = new DQNAgent(game.teamA.players[3], game);
const dqnAgent4 = new DQNAgent(game.teamA.players[4], game);
dqnAgent.train(1, 0.99, 0.001, 100, 1000, "").then(r => {});
dqnAgent1.train(1, 0.99, 0.001, 100, 1000, "").then(r => {});
dqnAgent2.train(1, 0.99, 0.001, 100, 1000, "").then(r => {});
dqnAgent3.train(1, 0.99, 0.001, 100, 1000, "").then(r => {});
dqnAgent4.train(1, 0.99, 0.001, 100, 1000, "").then(r => {});