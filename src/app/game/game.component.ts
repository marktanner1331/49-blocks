import { AfterContentInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { GameCommand, GameCommandType } from '../models/game-command';
import { CurrentGameService } from '../services/current-game.service';
import { ResizeService } from '../services/resize.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {
  remainingCount: number = 0;
  boardSize:string = "100%";
  showMenu: boolean = false;

  @ViewChild("top") top?: ElementRef;

  constructor(
    private elementRef: ElementRef,
    private resizeService: ResizeService,
    private currentGameService: CurrentGameService) {
    currentGameService.postProcess.subscribe(x => this.processCommand(x));
  }

  get level():number {
    return this.currentGameService.currentGame?.levelNumber ?? 0;
  }

  onMenuClick() {
    this.showMenu = true;
  }

  onMenuDone() {
    this.showMenu = false;
  }

  resize() {
    let rect: DOMRect = this.elementRef.nativeElement.getBoundingClientRect();
    let topRect: DOMRect = this.top!.nativeElement.getBoundingClientRect();

    //for padding
    rect.width -= 10;

    rect.height -= topRect.height;
    this.boardSize = Math.min(rect.width, rect.height) + "px";
  }

  ngOnInit(): void {
    let subject: Subject<void> = new Subject();
    this.resizeService.addResizeEventListener(this.elementRef.nativeElement, () => {
      subject.next();
    });
    subject
      .pipe(debounceTime(50))
      .subscribe(() => {
        this.resize();
        //this.cdr.detectChanges();
      });
  }

  ngOnDestroy():void {
    this.resizeService.removeResizeEventListener(this.elementRef.nativeElement);
  }

  processCommand(command: GameCommand) {
    switch (command.type) {
      case GameCommandType.NEW_GAME:
      case GameCommandType.REMOVE_GROUP:
      case GameCommandType.UNDO:
      case GameCommandType.RESET:
        this.remainingCount = this.currentGameService.currentGame.grid.countRemainingBlocks();
        break;
    }
  }
}