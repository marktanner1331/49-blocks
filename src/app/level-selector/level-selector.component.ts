import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CurrentGameService } from '../services/current-game.service';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-level-selector',
  templateUrl: './level-selector.component.html',
  styleUrls: ['./level-selector.component.scss']
})
export class LevelSelectorComponent implements OnInit {
  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private storage: StorageService,
    private currentGameService: CurrentGameService) { }

  getRange(): number[] {
    let numbers:number[] = [];
    for(let i = 1;i <= 100;i++) {
      numbers.push(i);
    }
    return numbers;
  }

  isPlayable(level:number) {
    return level <= this.storage.currentLevel;
  }

  starCount(level:number):void[] {
    return Array(this.storage.starCount(level)).fill({});
  }

  invertedStarCount(level:number):void[] {
    return Array(3 - this.storage.starCount(level)).fill({});
  }

  play(level:number) {
    this.currentGameService.newGame(level);
    this.router.navigateByUrl("game");
  }

  ngOnInit(): void {
    this.cdr.detach();
    this.cdr.detectChanges();
  }
}
