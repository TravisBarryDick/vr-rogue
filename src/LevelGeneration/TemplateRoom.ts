import { Array2D } from "../Array2D";
import { Tile } from "../Level";
import { Room, isValidDoor } from "./LevelGeneration";
import { RandomNumberGenerator } from "../RandomNumberGenerator";
import { Rectangle } from "../Utils";

/**
 * Interprets a string as a TemplateRoom. Each line of the input string
 * corresponds to one row of the room. A '#' character places a well, a '.'
 * character places a floor tile, and a '=' character places a door. Any other
 * character is treated as empty space.
 */
export function parseTemplateRoom(room: string): TemplateRoom {
  let lines = room.split("\n").filter(s => s.length > 0);
  const height = lines.length;
  const width = lines[0].length;
  let tiles = new Array2D<Tile>(height, width, Tile.Empty);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const char = lines[y][x];
      if (char === "#") {
        tiles.set(y, x, Tile.Wall);
      } else if (char === ".") {
        tiles.set(y, x, Tile.Floor);
      } else if (char === "=") {
        tiles.set(y, x, Tile.Door);
      }
    }
  }
  return new TemplateRoom(tiles);
}

export class TemplateRoom implements Room {
  constructor(private tiles: Array2D<Tile>) {}

  height() {
    return this.tiles.height;
  }

  width() {
    return this.tiles.width;
  }

  canPlaceAt(tiles: Array2D<Tile>, py: number, px: number): boolean {
    // Rules for TemplateRoom placement:
    // 1. Cannot place any tile on an existing floor or door tile.
    // 2. At least one door must be a valid door.
    const roomRect = new Rectangle(0, 0, this.height(), this.width());
    let anyValidDoor = false;
    for (let c of roomRect.areaCoords()) {
      const levelTile = tiles.get(c.y + py, c.x + px);
      const roomTile = this.tiles.get(c.y, c.x);
      if (roomTile !== Tile.Empty) {
        if (levelTile === Tile.Floor || levelTile === Tile.Door) return false;
      }
      if (roomTile === Tile.Door) {
        if (isValidDoor(tiles, c.y + py, c.x + px)) anyValidDoor = true;
      }
    }
    return anyValidDoor;
  }

  placeAt(
    rng: RandomNumberGenerator,
    tiles: Array2D<Tile>,
    py: number,
    px: number
  ): void {
    const roomRect = new Rectangle(0, 0, this.height(), this.width());
    // Place walls and doors
    for (let c of roomRect.areaCoords()) {
      const roomTile = this.tiles.get(c.y, c.x);
      if (roomTile === Tile.Wall) tiles.set(c.y + py, c.x + px, roomTile);
      // All valid doors in the template are placed. Invalid doors are replaced
      // by walls.
      if (roomTile === Tile.Door) {
        if (isValidDoor(tiles, c.y + py, c.x + px)) {
          tiles.set(c.y + py, c.x + px, roomTile);
        } else {
          tiles.set(c.y + py, c.x + px, Tile.Wall);
        }
      }
    }
    // Place floors (need to do this second so that doors aren't validated by
    // this tile's floors)
    for (let c of roomRect.areaCoords()) {
      const roomTile = this.tiles.get(c.y, c.x);
      if (roomTile == Tile.Floor) {
        tiles.set(c.y + py, c.x + px, roomTile);
      }
    }
  }
}
