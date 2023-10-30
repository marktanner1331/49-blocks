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
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { HelpComponent } from './help/help.component';
import { BurgerMenuComponent } from './burger-menu/burger-menu.component';
import { ShareComponent } from './share/share.component';
import { ShareButtonsModule } from 'ngx-sharebuttons/buttons';
import { ShareIconsModule } from 'ngx-sharebuttons/icons';

@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    GameComponent,
    TileComponent,
    MainMenuComponent,
    LevelSelectorComponent,
    GameOverComponent,
    HelpComponent,
    BurgerMenuComponent,
    ShareComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    ShareButtonsModule,
    ShareIconsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
