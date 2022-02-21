import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { TileColor } from '../models/tile-color';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss']
})
export class TileComponent implements OnInit {
  @Input() tileColor?: TileColor;

  @Input() size: string = "";

  @HostBinding('style.width')
  public get width(): string {
    return this.size;
  }

  @HostBinding('style.height')
  public get height(): string {
    return this.size;
  }

  @HostBinding('style.--background')
  public get background(): string {
    switch(this.tileColor) {
      case TileColor.EMPTY:
        return "none";
      case TileColor.BLUE:
        return "radial-gradient(#2291ff, #0051a2)";
      case TileColor.RED:
        return "radial-gradient(#ff3c9d, #a20051)";
      case TileColor.GREEN:
        return "radial-gradient(#9dff3c, #51a200)";
      // case TileColor.YELLOW:
      //   return "radial-gradient(#eeee00, #aaaa00)";
      default:
        throw new Error();
    }
  }

  @HostBinding('style.--border')
  public get border(): string {
    switch(this.tileColor) {
      case TileColor.EMPTY:
        return "none";
      default:
        return "1px solid black";
    }
  }

  constructor() { }

  ngOnInit(): void {
  }

}
