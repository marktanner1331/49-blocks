export class GameCommand {
    static GRID_COLLAPSED_LEFT: any;
    constructor(public type: GameCommandType, public data: any = null) { }

    static fromJson(json: any): GameCommand {
        return new GameCommand(json.type, json.data);
    }

    toJson(): any {
        return {
            type: this.type,
            data: this.data
        }
    }

    toString() {
        return "type: " + GameCommandType[this.type] + ", data: " + JSON.stringify(this.data);
    }
}

export enum GameCommandType {
  TILE_CLICKED,
  HIGHLIGHT_GROUP,
  GROUP_HIGHLIGHTED,
  REMOVE_GROUP,
  GRID_COLLAPSED_DOWN,
  BOARD_ANIMATION_STARTED,
  BOARD_ANIMATION_FINISHED,
  GRID_COLLAPSED_LEFT,
  NOP,
  GAME_COMPLETE,
  GROUP_REMOVED,
  NEW_GAME,
  UNDO,
  RESET,
  SHOW_HINT
}