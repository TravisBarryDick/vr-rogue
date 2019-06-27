import { Array2D } from "../Array2D";
import { Tile } from "../Level";
import { Room, RoomGen, isValidDoor } from "./LevelGeneration";
import { Rectangle, randomChoice } from "../Utils";
import { RandomNumberGenerator } from "../RandomNumberGenerator";

export class RectangularRoom implements Room {
  constructor(private _height: number, private _width: number) {}

  height() {
    return this._height;
  }

  width() {
    return this._width;
  }

  canPlaceAt(tiles: Array2D<Tile>, py: number, px: number): boolean {
    let atLeastOneDoor = false;
    const rect = new Rectangle(py, px, this.height(), this.width());
    // Check to make sure there is at least one valid door
    for (let c of rect.perimeterCoords(1)) {
      if (isValidDoor(tiles, c.y, c.x)) {
        atLeastOneDoor = true;
      }
    }
    // Check to make sure we don't overlap with any existing floor tiles
    for (let c of rect.areaCoords()) {
      if (tiles.get(c.y, c.x) === Tile.Floor) return false;
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
    // Place doors
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

export function RectangleRoomGenerator(
  minHeight: number,
  maxHeight: number,
  minWidth: number,
  maxWidth: number
): RoomGen {
  return rng => {
    const height = Math.ceil(rng.next() * (maxHeight - minHeight)) + minHeight;
    const width = Math.ceil(rng.next() * (maxWidth - minWidth)) + minWidth;
    return new RectangularRoom(height, width);
  };
}
