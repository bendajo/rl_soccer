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
const dqnAgent = new DQNAgent(game.teamA.players[0]);
dqnAgent.train().then(r => {});