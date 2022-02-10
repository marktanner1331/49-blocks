import * as _ from "lodash";
import { TileColor } from "./tile-color";

export class Solution {
    score: number = 0;
    column:number = 0;
    row: number = 0;
    previous?: Solution;
}

class GridSetOld {
    data: {[key: number]: any } = {};

    add(grid: Grid) {
        let tree = this.data;

        for(let column = 0;column < grid.width - 1;column++) {
            let hash = this.hashColumn(grid.tiles[column]);
            if(tree[hash]) {
                tree = tree[hash];
            } else {
                tree[hash] = {};
                tree = tree[hash];
            }
        }

        tree[this.hashColumn(grid.tiles[grid.width - 1])] = true;
    }

    contains(grid: Grid): boolean {
        let tree = this.data;

        for(let column = 0;column < grid.width;column++) {
            let hash = this.hashColumn(grid.tiles[column]);
            if(tree[hash]) {
                tree = tree[hash];
            } else {
                return false;
            }
        }

        return true;
    }

    hashColumn(column: TileColor[]):number {
        let number = 0;
        for(let tile of column) {
            number <<= 2;
            number += tile;
        }

        return number;
    }
}

class GridSet {
    data: {[key: string]: boolean } = {};

    add(grid: Grid) {
        this.data[this.hashGrid(grid)] = true;
    }

    contains(grid: Grid): boolean {
        return this.data[this.hashGrid(grid)];
    }

    hashGrid(grid: Grid):string {
        return grid.tiles.map(x => x.join()).join();
    }
}

export class Grid {
    constructor(public width: number, public height: number, public tiles: TileColor[][]) {
    }

    //returns the number of remaining blocks for the best solution
    findBestSolution(): number {
        let grids: [Grid, Solution|undefined][] = [];
        grids.push([this.clone(), undefined]);

        //start by setting to max value
        let bestScore = this.width * this.height;
        let bestSolution: Solution|undefined = undefined;

        let gridSet: GridSet = new GridSet();

        let i = 300000;
        let j = 0;
        while (grids.length > 0) {
            j++;
            if(i-- == 0) {
                break;
            }

            let grid = grids.pop()!;

            let groups = grid[0].getAllColorGroupSeeds();
            if(groups.length == 0) {
                //we have reached the end
                if(grid[0].countRemainingBlocks() < bestScore) {
                    bestScore = grid[0].countRemainingBlocks();
                    bestSolution = grid[1];
                }
                
                continue;
            }
            
            for(let group of groups) {
                let subGrid = grid[0].clone();
                subGrid.removeGroup(this.getColorGroup(group[0], group[1]));
                subGrid.collapseGridDown();
                subGrid.collapseGridLeft();
                
                if(gridSet.contains(subGrid)) {
                    continue;
                }

                gridSet.add(subGrid);

                let newSolution: Solution = new Solution();
                newSolution.previous = grid[1];
                newSolution.column = group[0];
                newSolution.row = group[1];
                grids.push([subGrid, newSolution]);
            }
        }
        
        console.log(j);
        let route: [number, number][] = [];
        while(bestSolution != undefined) {
            route.push([bestSolution.column, bestSolution.row]);
            bestSolution = bestSolution.previous;
        }
        route.reverse();
        console.log(route);

        return bestScore;
    }

    countRemainingBlocks(): number {
        let count = 0;
        for (let column = 0; column < this.width; column++) {
            for (let row = 0; row < this.height; row++) {
                if (this.tiles[column][row] != TileColor.EMPTY) {
                    count++;
                }
            }
        }

        return count;
    }

    clone(): Grid {
        return new Grid(this.width, this.height, this.tiles.map(x => x.map(y => y)));
    }

    collapseGridDown() {
        for (let column = 0; column < this.width; column++) {
            let base = 0;
            for (let row = 0; row < this.height; row++) {
                if (this.tiles[column][row] != TileColor.EMPTY) {
                    if (row != base) {
                        this.tiles[column][base] = this.tiles[column][row];
                        this.tiles[column][row] = TileColor.EMPTY;
                    }

                    base++;
                }
            }
        }
    }

    gridHasEmptyColumns(): boolean {
        for (let column = 0; column < this.width; column++) {
            if (_.some(this.tiles[column], x => x != TileColor.EMPTY) == false) {
                return true;
            }
        }

        return false;
    }

    collapseGridLeft() {
        let width = this.width;
        for (let column = 0; column < width; column++) {
            if (_.every(this.tiles[column], x => x == TileColor.EMPTY)) {
                this.tiles.splice(column, 1);
                this.tiles.push(Array(this.height).fill(TileColor.EMPTY));
                column--;
                width--;
            }
        }
    }

    getTileDeltasForGridCollapseLeft(): [number, number, number][] {
        let deltas: [number, number, number][] = [];

        let delta = 0;
        for (let column = 0; column < this.width; column++) {
            if (_.every(this.tiles[column], x => x == TileColor.EMPTY)) {
                delta++;
            } else {
                for (let row = 0; row < this.height; row++) {
                    deltas.push([column, row, -delta]);
                }
            }
        }

        return deltas;
    }

    getTileDeltasForGridCollapseDown(): [number, number, number][] {
        let deltas: [number, number, number][] = [];

        for (let column = 0; column < this.width; column++) {
            let base = 0;
            for (let row = 0; row < this.height; row++) {
                if (this.tiles[column][row] != TileColor.EMPTY) {
                    if (row != base) {
                        deltas.push([column, row, base - row]);
                    }

                    base++;
                }
            }
        }

        return deltas;
    }

    removeGroup(group: [number, number][]) {
        for (let tile of group) {
            this.tiles[tile[0]][tile[1]] = TileColor.EMPTY;
        }
    }

    countColorGroup(seedColumn: number, seedRow: number): number {
        return this.getColorGroup(seedColumn, seedRow).length;
    }

    getAllColorGroups(): ColorGroup[] {
        let explored: { [key: string]: boolean } = {};

        let explore = (seedColumn: number, seedRow: number): ColorGroup => {
            let toExplore: [number, number][] = [[seedColumn, seedRow]];
            let seedColor: TileColor = this.tiles[seedColumn][seedRow];

            let colorGroup: ColorGroup = new ColorGroup();
            colorGroup.seedColumn = seedColumn;
            colorGroup.seedRow = seedRow;
            
            // initialize with max values
            colorGroup.bottom = this.height;
            colorGroup.top = 0;
            colorGroup.left = this.width;
            colorGroup.right = 0;

            while (toExplore.length > 0) {
                let tile = toExplore.pop()!;
                let column = tile[0];
                let row = tile[1];

                colorGroup.tiles.push(tile);
                colorGroup.top = Math.max(colorGroup.top, row);
                colorGroup.bottom = Math.min(colorGroup.bottom, row);
                colorGroup.right = Math.max(colorGroup.right, column);
                colorGroup.left = Math.min(colorGroup.left, column);

                explored[`${column}, ${row}`] = true;

                if (column > 0) {
                    if (this.tiles[column - 1][row] == seedColor && explored[`${column - 1}, ${row}`] == undefined) {
                        toExplore.push([column - 1, row]);
                    }
                }

                if (column < this.width - 1) {
                    if (this.tiles[column + 1][row] == seedColor && explored[`${column + 1}, ${row}`] == undefined) {
                        toExplore.push([column + 1, row]);
                    }
                }

                if (row > 0) {
                    if (this.tiles[column][row - 1] == seedColor && explored[`${column}, ${row - 1}`] == undefined) {
                        toExplore.push([column, row - 1]);
                    }
                }

                if (row < this.height - 1) {
                    if (this.tiles[column][row + 1] == seedColor && explored[`${column}, ${row + 1}`] == undefined) {
                        toExplore.push([column, row + 1]);
                    }
                }
            }

            return colorGroup;
        };

        let groups: ColorGroup[] = [];
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                if (this.tiles[i][j] == TileColor.EMPTY) {
                    continue;
                }

                //it belongs to a previously explored group
                if (explored[`${i}, ${j}`] != undefined) {
                    continue;
                }

                let group = explore(i, j);
                if (group.tiles.length > 2) {
                    groups.push(group);
                }
            }
        }

        return groups;
    }

    //returns an array of seed tiles for every group with 3 or more tiles in it
    getAllColorGroupSeeds(): [number, number][] {
        let explored: { [key: string]: boolean } = {};

        let explore = (seedColumn: number, seedRow: number): number => {
            let toExplore: [number, number][] = [[seedColumn, seedRow]];
            let seedColor: TileColor = this.tiles[seedColumn][seedRow];
            let count = 0;
            while (toExplore.length > 0) {
                count++;

                let tile = toExplore.pop()!;
                let column = tile[0];
                let row = tile[1];

                explored[`${column}, ${row}`] = true;

                if (column > 0) {
                    if (this.tiles[column - 1][row] == seedColor && explored[`${column - 1}, ${row}`] == undefined) {
                        toExplore.push([column - 1, row]);
                    }
                }

                if (column < this.width - 1) {
                    if (this.tiles[column + 1][row] == seedColor && explored[`${column + 1}, ${row}`] == undefined) {
                        toExplore.push([column + 1, row]);
                    }
                }

                if (row > 0) {
                    if (this.tiles[column][row - 1] == seedColor && explored[`${column}, ${row - 1}`] == undefined) {
                        toExplore.push([column, row - 1]);
                    }
                }

                if (row < this.height - 1) {
                    if (this.tiles[column][row + 1] == seedColor && explored[`${column}, ${row + 1}`] == undefined) {
                        toExplore.push([column, row + 1]);
                    }
                }
            }

            return count;
        };

        let seeds: [number, number][] = [];
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                if (this.tiles[i][j] == TileColor.EMPTY) {
                    continue;
                }

                //it belongs to a previously explored group
                if (explored[`${i}, ${j}`] != undefined) {
                    continue;
                }

                let count = explore(i, j);
                if (count > 2) {
                    seeds.push([i, j]);
                }
            }
        }

        return seeds;
    }

    isComplete() {
        let explored: { [key: string]: boolean } = {};

        let explore = (seedColumn: number, seedRow: number): number => {
            let toExplore: [number, number][] = [[seedColumn, seedRow]];
            let seedColor: TileColor = this.tiles[seedColumn][seedRow];
            let count = 0;
            while (toExplore.length > 0) {
                count++;

                let tile = toExplore.pop()!;
                let column = tile[0];
                let row = tile[1];

                explored[`${column}, ${row}`] = true;

                if (column > 0) {
                    if (this.tiles[column - 1][row] == seedColor && explored[`${column - 1}, ${row}`] == undefined) {
                        toExplore.push([column - 1, row]);
                    }
                }

                if (column < this.width - 1) {
                    if (this.tiles[column + 1][row] == seedColor && explored[`${column + 1}, ${row}`] == undefined) {
                        toExplore.push([column + 1, row]);
                    }
                }

                if (row > 0) {
                    if (this.tiles[column][row - 1] == seedColor && explored[`${column}, ${row - 1}`] == undefined) {
                        toExplore.push([column, row - 1]);
                    }
                }

                if (row < this.height - 1) {
                    if (this.tiles[column][row + 1] == seedColor && explored[`${column}, ${row + 1}`] == undefined) {
                        toExplore.push([column, row + 1]);
                    }
                }
            }

            return count;
        };

        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                if (this.tiles[i][j] == TileColor.EMPTY) {
                    continue;
                }

                //it belongs to a previously explored group
                if (explored[`${i}, ${j}`] != undefined) {
                    continue;
                }

                let count = explore(i, j);
                if (count > 2) {
                    return false;
                }
            }
        }

        return true;
    }

    getColorGroup(seedColumn: number, seedRow: number): [number, number][] {
        let seedColor: TileColor = this.tiles[seedColumn][seedRow];

        let blocks: [number, number][] = [];
        let toExplore: [number, number][] = [[seedColumn, seedRow]];
        let explored: { [key: string]: boolean } = {};

        while (toExplore.length > 0) {
            let tile = toExplore.pop()!;
            let column = tile[0];
            let row = tile[1];

            explored[`${column}, ${row}`] = true;
            blocks.push([column, row]);

            if (column > 0) {
                if (this.tiles[column - 1][row] == seedColor && explored[`${column - 1}, ${row}`] == undefined) {
                    toExplore.push([column - 1, row]);
                }
            }

            if (column < this.width - 1) {
                if (this.tiles[column + 1][row] == seedColor && explored[`${column + 1}, ${row}`] == undefined) {
                    toExplore.push([column + 1, row]);
                }
            }

            if (row > 0) {
                if (this.tiles[column][row - 1] == seedColor && explored[`${column}, ${row - 1}`] == undefined) {
                    toExplore.push([column, row - 1]);
                }
            }

            if (row < this.height - 1) {
                if (this.tiles[column][row + 1] == seedColor && explored[`${column}, ${row + 1}`] == undefined) {
                    toExplore.push([column, row + 1]);
                }
            }
        }

        return blocks;
    }
}

class ColorGroup {
    seedColumn!: number;
    seedRow!: number;
    tiles:[number, number][] = [];
    left!: number;
    right!: number;
    top!: number;
    bottom!: number;
}