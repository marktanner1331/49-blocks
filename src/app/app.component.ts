import { Component } from '@angular/core';
import { Game } from './models/game';
import { Grid } from './models/Grid';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'color-connect';

  constructor() {
    // let levels: number[] = [];
    // let i = 0;
    // while(levels.length < 500) {
    //   let grid: Grid = new Game(7, 7, i).grid;
    //   if(grid.findBestSolution() == 0) {
    //     levels.push(i);
    //   }
    //   i++;
    // }

    // console.log(JSON.stringify(levels));
  }
}
