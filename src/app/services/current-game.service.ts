import { Injectable } from '@angular/core';
import { Game } from '../models/game';
import { GameCommand, GameCommandType } from '../models/game-command';
import { Grid } from '../models/Grid';
import { SyncSubject } from '../models/sync-subject';
import { SyncSubscription } from '../models/sync-subscription';
import { TileClickedHandler } from './tile-clicked-handler';

@Injectable({
  providedIn: 'root'
})
export class CurrentGameService {
  currentGame!: Game;

  private idleCounter: number = 0;

  idle: SyncSubject<void> = new SyncSubject();

  postProcess: SyncSubject<GameCommand> = new SyncSubject();

  commandQueue: GameCommand[] = [];
  private isProcessing: boolean = false;
  isBoardInited: boolean = false;

  tileClickedHandler: TileClickedHandler;

  previousGrid?: Grid;

  constructor() {
    this.tileClickedHandler = new TileClickedHandler(this);
    this.tileClickedHandler.register();

    this.postProcess.subscribe(x => this.removeGroupHandler(x));
    this.postProcess.subscribe(x => this.undoHandler(x));
    this.idle.subscribe(() => this.gameOverHandler());
  }

  boardInited() {
    this.isBoardInited = true;
    if(this.commandQueue.length) {
      this.processCommand();
    }
  }

  boardDestroyed() {
    this.isBoardInited = false;
  }

  newGame(level:number) {
    this.currentGame = new Game(7, 7, level);
    this.pushCommand(new GameCommand(GameCommandType.NEW_GAME));
  }

  replay() {
    this.currentGame = new Game(7, 7, this.currentGame.levelNumber);
    this.pushCommand(new GameCommand(GameCommandType.NEW_GAME));
  }

  pushCommand(command: GameCommand) {
    console.log("Pushing Command: " + command.toString());
    this.commandQueue.push(command);

    if (this.isProcessing == false && this.isBoardInited) {
      this.processCommand();
    }
  }

  isIdle() {
    return this.idleCounter == 0 && this.isProcessing == false;
  }

  processCommand() {
    this.isProcessing = true;

    while (this.commandQueue.length) {
      let command: GameCommand = this.commandQueue.shift()!;
      console.log("Processing Command: " + command.toString());

      // for (let callback of this.preProcess) {
      //   callback(command);
      // }

      //this.currentGame.processCommand(command);

      switch (command.type) {
        case GameCommandType.BOARD_ANIMATION_STARTED:
        case GameCommandType.GAME_COMPLETE:
          this.idleCounter++;
          break;
        case GameCommandType.BOARD_ANIMATION_FINISHED:
          this.idleCounter--;
          break;
        case GameCommandType.NEW_GAME:
          this.idleCounter = 0;
          break;
      }

      this.postProcess.next(command);


      if (this.commandQueue.length == 0) {
        console.log("idle counter: " + this.idleCounter);
        if (this.idleCounter == 0) {
          console.log("idle");
          this.idle.next();
        }
      }
    }

    this.isProcessing = false;
  }

  undoHandler(command: GameCommand) {
    if(command.type == GameCommandType.UNDO) {
      this.currentGame.grid = this.previousGrid!;
      this.previousGrid = undefined;
    } else if(command.type == GameCommandType.NEW_GAME) {
      this.previousGrid = undefined;
    }
  }

  removeGroupHandler(command: GameCommand) {
    if (command.type == GameCommandType.REMOVE_GROUP) {
      let collapseDown = (x: GameCommand) => {
        if (x.type == GameCommandType.BOARD_ANIMATION_FINISHED) {
          subscription.unsubscribe();
          subscription = this.postProcess.subscribe(x => collapseLeft(x));

          this.currentGame.grid.collapseGridDown();
          this.pushCommand(new GameCommand(GameCommandType.GRID_COLLAPSED_DOWN));
        }
      };

      let collapseLeft = (x: GameCommand) => {
        if (x.type == GameCommandType.BOARD_ANIMATION_FINISHED) {
          subscription.unsubscribe();

          if (this.currentGame.grid.gridHasEmptyColumns()) {
            this.currentGame.grid.collapseGridLeft();
            this.pushCommand(new GameCommand(GameCommandType.GRID_COLLAPSED_LEFT));
          }
        }
      };

      let subscription: SyncSubscription<GameCommand> = this.postProcess.subscribe(x => collapseDown(x));

      this.previousGrid = this.currentGame.grid.clone();
      this.currentGame.grid.removeGroup(command.data);
      this.pushCommand(new GameCommand(GameCommandType.GROUP_REMOVED));
    }
  }

  gameOverHandler(): void {
    console.log("remaining blocks: " + this.currentGame.grid.countRemainingBlocks());
    if (this.currentGame.grid.isComplete()) {
      this.pushCommand(new GameCommand(GameCommandType.GAME_COMPLETE));
    }
  }
}
