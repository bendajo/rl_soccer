import { MathUtils } from "three";
import { Player } from "../player";

export class PlayerControlService {
    public playerControl() {
        window.addEventListener("keydown", function (event) {
            const key = event.key; // "ArrowRight", "ArrowLeft", "ArrowUp", or "ArrowDown"
            if (typeof this.selectedPlayer === 'undefined') {
                return;
            }
            if(key == "ArrowLeft"){
                this.selectedPlayer.left = true;
                this.selectedPlayer.rotation.y = MathUtils.degToRad(-90)
            }
            if(key == "ArrowRight"){
                this.selectedPlayer.right = true;
                this.selectedPlayer.rotation.y = MathUtils.degToRad(90)
            }
            if(key == "ArrowUp"){
                this.selectedPlayer.upd = true;
                this.selectedPlayer.rotation.y = MathUtils.degToRad(180)
            }
            if(key == "ArrowDown"){
                this.selectedPlayer.down = true;
                this.selectedPlayer.rotation.y = MathUtils.degToRad(0)
            }
            if(event.code == "Space"){
                this.selectedPlayer.shootBall();
            }
        });
        window.addEventListener("keyup", function (event) {
            const key = event.key; // "ArrowRight", "ArrowLeft", "ArrowUp", or "ArrowDown"
            if (typeof this.selectedPlayer === 'undefined')
                return;
            if(key == "ArrowLeft"){
                this.selectedPlayer.left = false;
            }
            if(key == "ArrowRight"){
                this.selectedPlayer.right = false;
            }
            if(key == "ArrowUp"){
                this.selectedPlayer.upd = false;
            }
            if(key == "ArrowDown"){
                this.selectedPlayer.down = false;
            }
        });
    }
    public playerControl2(player: Player) {
        window.addEventListener("keydown", function (event) {
            const key = event.key; // "ArrowRight", "ArrowLeft", "ArrowUp", or "ArrowDown"
            if (typeof player === 'undefined') {
                return;
            }
            if(key == "a"){
                player.left = true;
                player.rotation.y = MathUtils.degToRad(-90)
            }
            if(key == "d"){
                player.right = true;
                player.rotation.y = MathUtils.degToRad(90)
            }
            if(key == "w"){
                player.upd = true;
                player.rotation.y = MathUtils.degToRad(180)
            }
            if(key == "s"){
                player.down = true;
                player.rotation.y = MathUtils.degToRad(0)
            }
            if(event.code == "Space"){
                player.shootBall();
            }
        });
        window.addEventListener("keyup", function (event) {
            const key = event.key; // "ArrowRight", "ArrowLeft", "ArrowUp", or "ArrowDown"
            if (typeof player === 'undefined')
                return;
            if(key == "a"){
                player.left = false;
            }
            if(key == "d"){
                player.right = false;
            }
            if(key == "w"){
                player.upd = false;
            }
            if(key == "s"){
                player.down = false;
            }
        });
    }
}