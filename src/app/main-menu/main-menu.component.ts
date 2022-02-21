import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CurrentGameService } from '../services/current-game.service';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  onPlayClick() {
    this.router.navigateByUrl("levels");
  }
}
