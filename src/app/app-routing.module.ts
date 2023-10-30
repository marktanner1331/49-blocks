import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameComponent } from './game/game.component';
import { HelpComponent } from './help/help.component';
import { LevelSelectorComponent } from './level-selector/level-selector.component';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { ShareComponent } from './share/share.component';

const routes: Routes = [
  { path: '', component: MainMenuComponent },
  { path: 'levels', component: LevelSelectorComponent },
  { path: 'game', component: GameComponent },
  { path: 'help', component: HelpComponent },
  { path: "share", component: ShareComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
