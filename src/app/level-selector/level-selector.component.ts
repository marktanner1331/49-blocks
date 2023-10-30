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

  hideComplete: boolean = false;

  getRange(): number[] {
    let numbers:number[] = [];
    let range: number = this.storage.currentLevel + 100;
    range = range - (range % 100);
    range = Math.min(range, 500);

    for(let i = 1;i <= range;i++) {
      if(this.hideComplete) {
        if(this.storage.starCount(i) < 3) {
          numbers.push(i);
        }
      } else {
        numbers.push(i);
      }
    }

    return numbers;
  }

  toggleHideComplete() {
    this.hideComplete = !this.hideComplete;
    this.cdr.detectChanges();
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
