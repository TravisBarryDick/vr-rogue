import { Array2D } from "../Array2D";
import { Tile } from "../Level";
import { Room, RoomGen, isValidDoor } from "./LevelGeneration";
import { randomChoice } from "../Utils";
import { RandomNumberGenerator } from "../RandomNumberGenerator";
import { Rectangle } from "../Rectangle";

export class RectangularRoom implements Room {
  constructor(private _height: number, private _width: number) {}

  height() {
    return this._height;
  }

  width() {
    return this._width;
  }

  canPlaceAt(tiles: Array2D<Tile>, py: number, px: number): boolean {
    // Rules for RectangleRoom Placement:
    // 1. Must not overlap with any floor or door tiles already in the level.
    // 2. There must be at least one valid door location (i.e., a location along
    //    the room's wall - but not a corner - that is adjacent to a floor tile
    //    alreay in the level).
    const rect = new Rectangle(py, px, this.height(), this.width());
    // Check to make sure we don't overlap with any existing floor or door tiles
    for (let c of rect.areaCoords()) {
      const levelTile = tiles.get(c.y, c.x);
      if (levelTile === Tile.Floor || levelTile === Tile.Door) return false;
    }
    // Check to make sure there is at least one valid door
    let atLeastOneDoor = false;
    for (let c of rect.perimeterCoords(1)) {
      if (isValidDoor(tiles, c.y, c.x)) {
        atLeastOneDoor = true;
      }
    }
    return atLeastOneDoor;
  }

  placeAt(
    rng: RandomNumberGenerator,
    tiles: Array2D<Tile>,
    py: number,
    px: number
  ): void {
    const rect = new Rectangle(py, px, this.height(), this.width());
    // Place wall tiles
    for (let c of rect.perimeterCoords()) {
      tiles.set(c.y, c.x, Tile.Wall);
    }
    // Place door
    let validDoors = Array<{ y: number; x: number }>();
    for (let c of rect.perimeterCoords(1)) {
      if (isValidDoor(tiles, c.y, c.x)) {
        validDoors.push({ ...c });
      }
    }
    if (validDoors.length > 0) {
      let door = randomChoice(rng, validDoors);
      tiles.set(door.y, door.x, Tile.Door);
    }
    // Place floor tiles
    for (let c of rect.enlarge(-2, -2).areaCoords()) {
      tiles.set(c.y, c.x, Tile.Floor);
    }
  }
}

/**
 * Returns a `RoomGen` instance that returns random RectangleRoom's whose height
 * and width are in the given ranges. The ranges include both min and max values
 */
export function RectangleRoomGenerator(
  minHeight: number,
  maxHeight: number,
  minWidth: number,
  maxWidth: number
): RoomGen {
  return rng => {
    const h = Math.floor(rng.next() * (maxHeight - minHeight)) + minHeight;
    const w = Math.floor(rng.next() * (maxWidth - minWidth)) + minWidth;
    return new RectangularRoom(h, w);
  };
}
