import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { GameCommand, GameCommandType } from '../models/game-command';
import { CurrentGameService } from '../services/current-game.service';

@Component({
  selector: 'app-burger-menu',
  templateUrl: './burger-menu.component.html',
  styleUrls: ['./burger-menu.component.scss']
})
export class BurgerMenuComponent implements OnInit {
  @Output() done:EventEmitter<void> = new EventEmitter();

  constructor(
    private currentGameService: CurrentGameService,
    private router: Router) { }

  get canUndo(): boolean {
    return this.currentGameService.previousGrid != undefined;
  }

  ngOnInit(): void {
  }

  reset() {
    this.currentGameService.pushCommand(new GameCommand(GameCommandType.RESET));
    this.done.next();
  }

  home() {
    this.router.navigateByUrl("levels");
  }

  hint() {
    this.currentGameService.pushCommand(new GameCommand(GameCommandType.SHOW_HINT));
    this.done.next();
  }

  blockerClick() {
    this.done.next();
  }

  undo() {
    this.currentGameService.pushCommand(new GameCommand(GameCommandType.UNDO));
    this.done.next();
  }
}
