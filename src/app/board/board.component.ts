import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Guid } from 'guid-typescript';
import { Game } from '../models/game';
import { GameCommand, GameCommandType } from '../models/game-command';
import { Grid } from '../models/Grid';
import { TileColor } from '../models/tile-color';
import { CurrentGameService } from '../services/current-game.service';
import { StyleService } from '../services/style.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
  grid: Grid = new Grid(0, 0, []);
  collapseDownDeltas: { [key: string]: number } = {};
  collapseLeftDeltas: { [key: string]: number } = {};

  constructor(
    private cdr: ChangeDetectorRef,
    private currentGameService: CurrentGameService,
    private styleService: StyleService) {
    currentGameService.postProcess.push(x => this.processCommand(x));
  }

  processCommand(command: GameCommand) {
    switch (command.type) {
      case GameCommandType.GROUP_REMOVED:
        this.grid = this.currentGameService.currentGame.grid.clone();
        this.cdr.detectChanges();
        break;
      case GameCommandType.GRID_COLLAPSED_DOWN:
        this.collapseDownDeltas = {};

        let highestDelta = 0;
        for (let delta of this.grid.getTileDeltasForGridCollapseDown()) {
          this.collapseDownDeltas[`${delta[0]}, ${delta[1]}`] = delta[2];
          highestDelta = Math.min(highestDelta, delta[2]);
        }

        if(Object.keys(this.collapseDownDeltas).length) {
          this.currentGameService.pushCommand(new GameCommand(GameCommandType.ANIMATING_COLLAPSE_STARTED));
          this.cdr.detectChanges();
          
          setTimeout(() => this.endCollapse(), Math.sqrt(-highestDelta / 20) * 1000);
        }
        break;
      case GameCommandType.GRID_COLLAPSED_LEFT:
        this.collapseLeftDeltas = {};

        for (let delta of this.grid.getTileDeltasForGridCollapseLeft()) {
          this.collapseLeftDeltas[`${delta[0]}, ${delta[1]}`] = delta[2];
        }

        if(Object.keys(this.collapseLeftDeltas).length) {
          this.currentGameService.pushCommand(new GameCommand(GameCommandType.ANIMATING_COLLAPSE_STARTED));
          this.cdr.detectChanges();
  
          setTimeout(() => this.endCollapse(), 250);
        }
        break;
    }
  }

  getCollapseClass(column: number, row: number): { [key: string]: boolean } {
    let classes: { [key: string]: boolean } = {};

    let delta = this.collapseDownDeltas[`${column}, ${row}`];
    if (delta) {
      let randomName = Guid.create().toString();
      this.styleService.setKeyFrame("keyframes-" + randomName, [
        //"from {bottom: calc(" + row + ' * ' + this.tileSize() + ")}",
        "to {bottom: calc(" + (row + delta) + ' * ' + this.tileSize() + ")}"
      ]);

      this.styleService.setStyle(".collapse-" + randomName, "animation", "keyframes-" + randomName + " " + Math.sqrt(-delta / 20) + "s ease-in 0s normal forwards");

      classes["collapse-" + randomName] = true;
    }

    delta = this.collapseLeftDeltas[`${column}, ${row}`];
    if (delta) {
      let randomName = Guid.create().toString();
      this.styleService.setKeyFrame("keyframes-" + randomName, [
        //"from {left: calc(" + column + ' * ' + this.tileSize() + ")}",
        "to {left: calc(" + (column + delta) + ' * ' + this.tileSize() + ")}"
      ]);

      this.styleService.setStyle(".collapse-" + randomName, "animation", "keyframes-" + randomName + " 0.25s ease-in 0s normal forwards");

      classes["collapse-" + randomName] = true;
    }

    return classes;
  }

  endCollapse() {
    this.collapseDownDeltas = {};
    this.collapseLeftDeltas = {};
    this.grid = this.currentGameService.currentGame.grid.clone();
    this.cdr.detectChanges();

    this.currentGameService.pushCommand(new GameCommand(GameCommandType.ANIMATING_COLLAPSE_FINISHED));
  }

  get gridWidth(): number {
    return this.grid.width;
  }

  get gridHeight(): number {
    return this.grid.height;
  }

  tileSize(): string {
    return `min(${100 / this.grid.width}vw, ${100 / this.grid.height}vh)`;
  }

  tileAt(column: number, row: number): TileColor {
    return this.grid.tiles[column][row];
  }

  range(n: number): number[] {
    let array = [];
    for (let i = 0; i < n; i++) {
      array.push(i);
    }
    return array;
  }

  tileClicked(column: number, row: number) {
    this.currentGameService.pushCommand(new GameCommand(GameCommandType.TILE_CLICKED, [column, row]));
  }

  ngOnInit(): void {
    this.grid = this.currentGameService.currentGame.grid.clone();
    this.cdr.detach();
    this.cdr.detectChanges();
  }
}
