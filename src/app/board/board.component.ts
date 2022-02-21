import { AfterContentChecked, AfterContentInit, ChangeDetectorRef, Component, ElementRef, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Guid } from 'guid-typescript';
import { Subject } from 'rxjs';
import { debounceTime, delay } from 'rxjs/operators';
import { Game } from '../models/game';
import { GameCommand, GameCommandType } from '../models/game-command';
import { Grid } from '../models/Grid';
import { SyncSubscription } from '../models/sync-subscription';
import { TileColor } from '../models/tile-color';
import { CurrentGameService } from '../services/current-game.service';
import { ResizeService } from '../services/resize.service';
import { StyleSheet } from '../services/style.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit, OnDestroy {
  TileColor: typeof TileColor = TileColor;

  _tileSize: number = 0;
  get tileSize(): string {
    return this._tileSize + "px";
  };

  @HostBinding('style.border-bottom-right-radius')
  public get borderBottomRightRadius(): string {
    return this._tileSize / 2 + "px";
  }

  @HostBinding('style.border-bottom-left-radius')
  public get borderBottomLeftRadius(): string {
    return this._tileSize / 2 + "px";
  }

  grid: Grid = new Grid(0, 0, []);
  collapseDownDeltas: { [key: number]: number } = {};
  collapseLeftDeltas: { [key: number]: number } = {};

  previousDownGrid!: Grid;
  previousCollapseDownDeltas: { [key: number]: number } = {};
  previousCollapseLeftDeltas: { [key: number]: number } = {};

  undoCollapseDownDeltas: { [key: number]: number } = {};
  undoCollapseLeftDeltas: { [key: number]: number } = {};

  postProcessSubscription!: SyncSubscription<GameCommand>;

  newGameAnimation: boolean = false;
  undoCollapseDownAnimation: boolean = false;
  undoCollapseLeftAnimation: boolean = false;

  styleSheet!: StyleSheet;

  imageIndex: string = "0";

  get canUndo(): boolean {
    return this.currentGameService.previousGrid != undefined;
  }

  constructor(
    private router: Router,
    private resizeService: ResizeService,
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef,
    private currentGameService: CurrentGameService) {
    this.cdr.detach();
  }

  processCommand(command: GameCommand) {
    switch (command.type) {
      case GameCommandType.NEW_GAME:
        this.imageIndex = (Math.floor(Math.random() * 15) + 1).toString().padStart(2, "0");

        this.previousCollapseDownDeltas = {};
        this.previousCollapseLeftDeltas = {};
        this.undoCollapseDownDeltas = {};
        this.undoCollapseLeftDeltas = {};

        this.grid = this.currentGameService.currentGame.grid.clone();
        this.resize();

        this.styleSheet = new StyleSheet();
        this.newGameAnimation = true;
        this.currentGameService.pushCommand(new GameCommand(GameCommandType.BOARD_ANIMATION_STARTED));

        this.cdr.detectChanges();

        setTimeout(() => this.endNewAniimation(), 1500);
        break;
      case GameCommandType.UNDO:
        {
          this.undoCollapseDownDeltas = {};
          this.undoCollapseLeftDeltas = {};
          let highestDownDelta = 0;
          let highestLeftDelta = 0;

          for (let i = 0; i < this.grid.height * this.grid.width; i++) {
            if (this.previousCollapseDownDeltas[i]) {
              let newKey = i + this.previousCollapseDownDeltas[i];
              this.undoCollapseDownDeltas[newKey] = -this.previousCollapseDownDeltas[i];
              highestDownDelta = Math.min(highestDownDelta, this.previousCollapseDownDeltas[i]);
            }

            if (this.previousCollapseLeftDeltas[i]) {
              let newKey = i + this.previousCollapseLeftDeltas[i] * this.gridHeight;
              this.undoCollapseLeftDeltas[newKey] = -this.previousCollapseLeftDeltas[i];
              highestLeftDelta = Math.min(highestLeftDelta, this.previousCollapseLeftDeltas[i]);
            }
          }

          this.currentGameService.pushCommand(new GameCommand(GameCommandType.BOARD_ANIMATION_STARTED))

          let undoLeft = () => {
            if (Object.keys(this.undoCollapseLeftDeltas).length) {
              this.styleSheet = new StyleSheet();
              this.undoCollapseLeftAnimation = true;
              this.cdr.detectChanges();

              setTimeout(() => {
                this.undoCollapseLeftAnimation = false;
                this.previousCollapseLeftDeltas = {};
                this.grid = this.previousDownGrid;
                this.styleSheet.destroy();
                undoDown();
              }, Math.sqrt(-highestLeftDelta / 20) * 1000);
            } else {
              undoDown();
            }
          };

          let undoDown = () => {
            if (Object.keys(this.undoCollapseDownDeltas).length) {
              this.undoCollapseDownAnimation = true;
              this.styleSheet = new StyleSheet();

              setTimeout(() => {
                this.undoCollapseDownAnimation = false;
                this.previousCollapseDownDeltas = {};
                this.styleSheet.destroy();

                this.grid = this.currentGameService.currentGame.grid.clone();
                this.cdr.detectChanges();
                this.currentGameService.pushCommand(new GameCommand(GameCommandType.BOARD_ANIMATION_FINISHED));
              }, Math.sqrt(-highestDownDelta / 20) * 1000);
              this.cdr.detectChanges();
            } else {
              this.grid = this.currentGameService.currentGame.grid.clone();
              this.cdr.detectChanges();
              this.currentGameService.pushCommand(new GameCommand(GameCommandType.BOARD_ANIMATION_FINISHED));
            }
          };

          undoLeft();
        }
        break;
      case GameCommandType.GROUP_REMOVED:
        this.grid = this.currentGameService.currentGame.grid.clone();

        this.cdr.detectChanges();

        this.currentGameService.pushCommand(new GameCommand(GameCommandType.BOARD_ANIMATION_STARTED));
        this.currentGameService.pushCommand(new GameCommand(GameCommandType.BOARD_ANIMATION_FINISHED));
        break;
      case GameCommandType.GRID_COLLAPSED_DOWN:
        this.collapseDownDeltas = this.grid.getTileDeltasForGridCollapseDown();

        let highestDelta = 0;
        for (let key in this.collapseDownDeltas) {
          highestDelta = Math.min(highestDelta, this.collapseDownDeltas[key]);
        }

        if (highestDelta != 0) {
          this.styleSheet = new StyleSheet();
          this.currentGameService.pushCommand(new GameCommand(GameCommandType.BOARD_ANIMATION_STARTED));
          this.cdr.detectChanges();

          this.previousDownGrid = this.currentGameService.currentGame.grid.clone();

          setTimeout(() => this.endCollapse(), Math.sqrt(-highestDelta / 20) * 1000);
        } else {
          this.currentGameService.pushCommand(new GameCommand(GameCommandType.BOARD_ANIMATION_STARTED));
          this.currentGameService.pushCommand(new GameCommand(GameCommandType.BOARD_ANIMATION_FINISHED));
        }
        break;
      case GameCommandType.GRID_COLLAPSED_LEFT:
        this.collapseLeftDeltas = this.grid.getTileDeltasForGridCollapseLeft();

        if (Object.keys(this.collapseLeftDeltas).length) {
          this.styleSheet = new StyleSheet();
          this.currentGameService.pushCommand(new GameCommand(GameCommandType.BOARD_ANIMATION_STARTED));
          this.cdr.detectChanges();

          setTimeout(() => this.endCollapse(), 250);
        } else {
          this.currentGameService.pushCommand(new GameCommand(GameCommandType.BOARD_ANIMATION_STARTED));
          this.currentGameService.pushCommand(new GameCommand(GameCommandType.BOARD_ANIMATION_FINISHED));
        }
        break;
    }
  }

  getClasses(column: number, row: number): { [key: string]: boolean } {
    let classes: { [key: string]: boolean } = {};

    let delta = this.collapseDownDeltas[column * this.gridHeight + row];
    if (delta) {
      let randomName = Guid.create().toString();
      this.styleSheet.addKeyFrame("keyframes-" + randomName, [
        //"from {bottom: calc(" + row + ' * ' + this.tileSize + ")}",
        "to {bottom: calc(" + (row + delta) + ' * ' + this.tileSize + ")}"
      ]);

      this.styleSheet.addClass(".collapse-" + randomName, {
        animation: "keyframes-" + randomName + " " + Math.sqrt(-delta / 20) + "s ease-in 0s normal forwards"
      });

      classes["collapse-" + randomName] = true;
    }

    delta = this.collapseLeftDeltas[column * this.gridHeight + row];
    if (delta) {
      let randomName = Guid.create().toString();
      this.styleSheet.addKeyFrame("keyframes-" + randomName, [
        //"from {left: calc(" + column + ' * ' + this.tileSize + ")}",
        "to {left: calc(" + (column + delta) + ' * ' + this.tileSize + ")}"
      ]);

      this.styleSheet.addClass(".collapse-" + randomName, {
        animation: "keyframes-" + randomName + " 0.25s ease-in 0s normal forwards"
      });

      classes["collapse-" + randomName] = true;
    }

    if (this.newGameAnimation) {
      let randomName = Guid.create().toString();
      this.styleSheet.addKeyFrame("keyframes-" + randomName, [
        "from {bottom: calc(" + (row + this.gridHeight + 2) + ' * ' + this.tileSize + ")}",
        "to {bottom: calc(" + row + ' * ' + this.tileSize + ")}"
      ]);

      let delay = (row * this.gridHeight / 2 + column) * 0.05 + "s";
      let duration = (this.gridHeight - row) * 0.1 + "s";

      this.styleSheet.addClass(".new-" + randomName, {
        animation: "keyframes-" + randomName + " " + duration + " ease-in " + delay + " normal forwards"
      });

      classes["new-" + randomName] = true;
    }

    if (this.undoCollapseDownAnimation) {
      delta = this.undoCollapseDownDeltas[column * this.gridHeight + row];
      
      if (delta) {
        let randomName = Guid.create().toString();
        this.styleSheet.addKeyFrame("keyframes-" + randomName, [
          //"from {bottom: calc(" + row + ' * ' + this.tileSize + ")}",
          "to {bottom: calc(" + (row + delta) + ' * ' + this.tileSize + ")}"
        ]);

        this.styleSheet.addClass(".undo-" + randomName, {
          animation: "keyframes-" + randomName + " " + Math.sqrt(delta / 20) + "s ease-out 0s normal forwards"
        });

        classes["undo-" + randomName] = true;
      }
    }

    if (this.undoCollapseLeftAnimation) {
      delta = this.undoCollapseLeftDeltas[column * this.gridHeight + row];

      if (delta) {
        let randomName = Guid.create().toString();
        this.styleSheet.addKeyFrame("keyframes-" + randomName, [
          //"from {bottom: calc(" + row + ' * ' + this.tileSize + ")}",
          "to {left: calc(" + (column + delta) + ' * ' + this.tileSize + ")}"
        ]);

        this.styleSheet.addClass(".undo-" + randomName, {
          animation: "keyframes-" + randomName + " " + Math.sqrt(delta / 20) + "s ease-out 0s normal forwards"
        });

        classes["undo-" + randomName] = true;
      }
    }

    return classes;
  }

  endNewAniimation() {
    this.newGameAnimation = false;
    this.styleSheet.destroy();
    this.cdr.detectChanges();

    this.currentGameService.pushCommand(new GameCommand(GameCommandType.BOARD_ANIMATION_FINISHED));
  }

  endCollapse() {
    if (Object.keys(this.collapseDownDeltas).length) {
      this.previousCollapseDownDeltas = this.collapseDownDeltas;
      this.collapseDownDeltas = {};
    }

    if (Object.keys(this.collapseLeftDeltas).length) {
      this.previousCollapseLeftDeltas = this.collapseLeftDeltas;
      this.collapseLeftDeltas = {};
    }

    this.collapseLeftDeltas = {};
    this.grid = this.currentGameService.currentGame.grid.clone();
    this.styleSheet.destroy();

    this.cdr.detectChanges();
    this.currentGameService.pushCommand(new GameCommand(GameCommandType.BOARD_ANIMATION_FINISHED));
  }

  get gridWidth(): number {
    return this.grid.width;
  }

  get gridHeight(): number {
    return this.grid.height;
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
    if (this.currentGameService.isIdle()) {
      this.currentGameService.pushCommand(new GameCommand(GameCommandType.TILE_CLICKED, [column, row]));
    }
  }

  resize() {
    let rect: DOMRect = this.elementRef.nativeElement.getBoundingClientRect();
    this._tileSize = Math.min(rect.width / this.gridWidth, rect.height / this.gridHeight);
  }

  ngOnDestroy() {
    this.resizeService.removeResizeEventListener(this.elementRef.nativeElement);
    this.postProcessSubscription?.unsubscribe();
    this.currentGameService.boardDestroyed();
    this.resizeService.removeResizeEventListener(this.elementRef.nativeElement);
  }

  ngOnInit(): void {
    if (!this.currentGameService.currentGame) {
      this.router.navigateByUrl('levels');
      return;
    }

    this.postProcessSubscription = this.currentGameService.postProcess.subscribe(x => this.processCommand(x));

    let subject: Subject<void> = new Subject();
    this.resizeService.addResizeEventListener(this.elementRef.nativeElement, () => {
      subject.next();
    });
    subject
      .pipe(debounceTime(50))
      .subscribe(() => {
        this.resize();
        this.cdr.detectChanges();
      });

    setTimeout(() => {
      this.currentGameService.boardInited();
    }, 100);
  }
}
