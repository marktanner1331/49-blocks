import { Injectable } from '@angular/core';
import { Game } from '../models/game';
import { GameCommand, GameCommandType } from '../models/game-command';

@Injectable({
  providedIn: 'root'
})
export class CurrentGameService {
  currentGame: Game;

  idleCounter: number = 0;

  idle: (() => void)[] = [];

  preProcess: ((command: GameCommand) => void)[] = [];
  postProcess: ((command: GameCommand) => void)[] = [];

  commandQueue: GameCommand[] = [];
  isProcessing: boolean = false;

  constructor() {
    this.currentGame = new Game(16, 8, 1);
    console.log("best solution: " + this.currentGame.grid.findBestSolution());

    this.postProcess.push(x => this.test(x));
    this.idle.push(() => this.testIdle());
  }

  pushCommand(command: GameCommand) {
    console.log("Pushing Command: " + command.toString());
    this.commandQueue.push(command);

    if (this.isProcessing == false) {
      this.processCommand();
    }
  }

  processCommand() {
    this.isProcessing = true;

    while (this.commandQueue.length) {
      let command: GameCommand = this.commandQueue.shift()!;
      console.log("Processing Command: " + command.toString());

      for (let callback of this.preProcess) {
        callback(command);
      }

      //this.currentGame.processCommand(command);

      switch (command.type) {
        case GameCommandType.ANIMATING_COLLAPSE_STARTED:
          this.idleCounter++;
          break;
        case GameCommandType.ANIMATING_COLLAPSE_FINISHED:
          this.idleCounter--;
          break;
      }

      // switch (command.type) {
      //   case GameCommandType.MOVED:
      //     if (this.currentGame.isComplete()) {
      //       this.commandQueue.length = 0;
      //       this.pushCommand(new GameCommand(GameCommandType.GAME_COMPLETE, this.currentGame.getWinningPlayer()));

      //       //we don't want the idle event firing
      //       this.idleCounter++;
      //       continue;
      //     }
      //     break;
      // }

      for (let callback of this.postProcess) {
        callback(command);
      }

      if (this.commandQueue.length == 0) {
        console.log("idle counter: " + this.idleCounter);
        if (this.idleCounter == 0) {
          console.log("idle");
          for (let callback of this.idle) {
            callback();
          }
        }
      }
    }

    this.isProcessing = false;
  }

  phase: number = 0;
  currentGroup: [number, number][] = [];
  test(command: GameCommand) {
    switch (command.type) {
      case GameCommandType.TILE_CLICKED:
        {
          let column = command.data[0];
          let row = command.data[1];

          this.currentGroup = this.currentGame.grid.getColorGroup(column, row);
          if (this.currentGroup.length < 3) {
            return;
          }

          this.phase = 1;
          this.pushCommand(new GameCommand(GameCommandType.HIGHLIGHT_GROUP, this.currentGroup));
        }
    }
  }

  testIdle() {
    switch (this.phase) {
      case 1:
        this.phase = 2;
        this.currentGame.grid.removeGroup(this.currentGroup);
        this.pushCommand(new GameCommand(GameCommandType.GROUP_REMOVED));
        break;
      case 2:
        this.phase = 3;
        this.currentGame.grid.collapseGridDown();
        this.pushCommand(new GameCommand(GameCommandType.GRID_COLLAPSED_DOWN));

        break;
      case 3:
        this.phase = 4;
        if(this.currentGame.grid.gridHasEmptyColumns()) {
          this.currentGame.grid.collapseGridLeft();
          this.pushCommand(new GameCommand(GameCommandType.GRID_COLLAPSED_LEFT));
        } else {
          this.pushCommand(new GameCommand(GameCommandType.NOP));
        }
        break;
      case 4:
        this.phase = 0;
        console.log("remaining blocks: " + this.currentGame.grid.countRemainingBlocks());
        if(this.currentGame.grid.isComplete()) {
          this.pushCommand(new GameCommand(GameCommandType.GAME_COMPLETE));
        }
        break;
    }
  }
}
