import * as _ from "lodash";
import { RNG } from "../utilities/RNG";
import { GameCommand, GameCommandType } from "./game-command";
import { Grid } from "./Grid";
import { TileColor } from "./tile-color";

export class Game {
    grid: Grid;
    rng: RNG = new RNG("color-connect");

    constructor(width: number, height: number, levelNumber: number) {
        this.grid = new Grid(width, height, []);
        this.rng.skip(levelNumber);

        for (let i = 0; i < this.grid.width; i++) {
            this.grid.tiles.push([]);
            for (let j = 0; j < this.grid.height; j++) {
                this.grid.tiles[i].push(Math.floor(this.rng.nextRand() * 4) + 1);
            }
        }
    }



   
}
