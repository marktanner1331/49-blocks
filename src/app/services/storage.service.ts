import { Injectable } from '@angular/core';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  currentLevel: number;
  data: { [key: string]: number };

  constructor() {
    let dataString = localStorage.getItem("data49");
    if (!dataString) {
      dataString = JSON.stringify({ "1": 0 });
    }

    this.data = JSON.parse(dataString);
    this.currentLevel = _.max(Object.keys(this.data).map(x => parseInt(x)))!;
  }

  starCount(level: number): number {
    if (level >= this.currentLevel) {
      return 0;
    }

    return this.data[level.toString()];
  }

  setStarCount(level:number, count:number) {
    if(this.data[level.toString()] < count) {
      this.data[level.toString()] = count;
      localStorage.setItem("data49", JSON.stringify(this.data));
    }
  }

  unlockLevel(level: number) {
    if(!this.data[level.toString()]) {
      this.data[level.toString()] = 0;
      localStorage.setItem("data49", JSON.stringify(this.data));
    }

    this.currentLevel = Math.max(this.currentLevel, level);
  }
}
