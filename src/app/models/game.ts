import * as _ from "lodash";
import { RNG } from "../utilities/RNG";
import { GameCommand, GameCommandType } from "./game-command";
import { Grid } from "./Grid";
import { TileColor } from "./tile-color";

export class Game {
    grid: Grid;
    rng: RNG = new RNG("color-connect");

    constructor(width: number, height: number, public levelNumber: number) {
        this.grid = new Grid(width, height, []);

        //levelNumber starts at 1
        this.rng.skip(this.solvableLevelMap[levelNumber - 1]);

        for (let i = 0; i < this.grid.width; i++) {
            this.grid.tiles.push([]);
            for (let j = 0; j < this.grid.height; j++) {
                this.grid.tiles[i].push(Math.floor(this.rng.nextRand() * 3) + 1);
            }
        }
    }

    private solvableLevelMap:number[] = [1,2,3,4,5,6,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,29,31,32,33,34,35,36,37,38,39,40,43,46,47,48,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,71,72,73,74,75,76,77,78,79,80,81,82,85,86,87,88,89,90,91,92,93,94,95,96,98,99,100,101,102,103,105,106,107,108,109,110,121,122,123,124];
}
