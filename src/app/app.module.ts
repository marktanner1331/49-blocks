import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BoardComponent } from './board/board.component';
import { GameComponent } from './game/game.component';
import { TileComponent } from './tile/tile.component';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { LevelSelectorComponent } from './level-selector/level-selector.component';
import { GameOverComponent } from './game-over/game-over.component';

@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    GameComponent,
    TileComponent,
    MainMenuComponent,
    LevelSelectorComponent,
    GameOverComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
