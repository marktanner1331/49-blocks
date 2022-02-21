import { GameCommand, GameCommandType } from "../models/game-command";
import { SyncSubscription } from "../models/sync-subscription";
import { CurrentGameService } from "./current-game.service";

export class TileClickedHandler {
    processSubscription!: SyncSubscription<GameCommand>;
    idleSubscription!: SyncSubscription<void>;
    
    constructor(private currentGameService: CurrentGameService) {

    }

    register() {
        this.processSubscription = this.currentGameService.postProcess.subscribe(x => this.processCommand(x));
    }

    unregister() {
        this.processSubscription.unsubscribe();
    }
    
    processCommand(command: GameCommand) {
      switch (command.type) {
        case GameCommandType.TILE_CLICKED:
          {
            let column = command.data[0];
            let row = command.data[1];
  
            let currentGroup = this.currentGameService.currentGame.grid.getColorGroup(column, row);
            if (currentGroup.length < 3) {
              return;
            }
  
            this.currentGameService.pushCommand(new GameCommand(GameCommandType.REMOVE_GROUP, currentGroup));
          }
      }
    }

}