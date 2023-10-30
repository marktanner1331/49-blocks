import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CurrentGameService } from '../services/current-game.service';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent implements OnInit {
  isAndroid: boolean;

  constructor(private router: Router) {
    var userAgent = navigator.userAgent || navigator.vendor;
    this.isAndroid = /android/i.test(userAgent);
  }

  ngOnInit(): void {
  }

  onPlayClick() {
    this.router.navigateByUrl("levels");
  }

  onHelpClick() {
    this.router.navigateByUrl("help");
  }

  onShareClick() {
    this.router.navigateByUrl("share?skipRedirect=true");
  }

  onRateClick() {
    document.location.href = "https://play.google.com/store/apps/details?id=com.fortynineblocks.twa";
  }
}
