import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameCommand, GameCommandType } from '../models/game-command';
import { SyncSubscription } from '../models/sync-subscription';
import { CurrentGameService } from '../services/current-game.service';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-game-over',
  templateUrl: './game-over.component.html',
  styleUrls: ['./game-over.component.scss']
})
export class GameOverComponent implements OnInit, OnDestroy {
  visible = false;
  remainingBlocks: number = 0;
  canMoveNext:boolean = false;
  starCount:void[] = [];
  invertedStarCount:void[] = [];

  postProcessSubscription!:SyncSubscription<GameCommand>;

  constructor(
    private currentGameService: CurrentGameService,
    private router: Router,
    private storageService: StorageService) { 
    
  }

  processCommand(command: GameCommand) {
    if(command.type == GameCommandType.GAME_COMPLETE) {
      this.visible = true;
      this.remainingBlocks = this.currentGameService.currentGame.grid.countRemainingBlocks();
      this.canMoveNext = this.currentGameService.currentGame.levelNumber < 500 && this.remainingBlocks < 6;

      if(this.canMoveNext) {
        this.storageService.unlockLevel(this.currentGameService.currentGame.levelNumber + 1);
      }

      let temp:number;
      switch(this.remainingBlocks) {
        case 0:
          temp = 3;
          break;
        case 1:
        case 2:
          temp = 2;
          break;
        case 3:
        case 4:
        case 5:
          temp = 1;
          break;
        default:
          temp = 0;
          break;
      }

      this.storageService.setStarCount(this.currentGameService.currentGame.levelNumber, temp);
      this.starCount = Array(temp).fill({});
      this.invertedStarCount = Array(3 - temp).fill({});
    }
  }

  onNextClick() {
    this.currentGameService.newGame(this.currentGameService.currentGame.levelNumber + 1);
    this.visible = false;
  }

  onBackClick() {
    this.router.navigateByUrl("levels");
  }

  onReplayClick() {
    this.currentGameService.replay();
    this.visible = false;
  }

  ngOnInit(): void {
    this.postProcessSubscription = this.currentGameService.postProcess.subscribe(x => this.processCommand(x));
  }

  ngOnDestroy(): void {
    this.postProcessSubscription?.unsubscribe();
  }
}
