import { Array2D } from "../Array2D";
import { Tile, TILES, WalkableComponent } from "../Tile";
import { Room, isValidDoor } from "./LevelGeneration";
import { RandomNumberGenerator } from "../RandomNumberGenerator";
import { Rectangle } from "../Rectangle";

/**
 * A simplified tile set used for room templates.
 */
enum TemplateTile {
  Empty,
  Wall,
  Floor,
  InternalDoor,
  ExternalDoor
}

/**
 * Converts a single character into an instance of TemplateTile
 */
function parseTemplateCharacter(c: string) {
  switch (c) {
    case "#":
      return TemplateTile.Wall;
    case ".":
      return TemplateTile.Floor;
    case "E":
      return TemplateTile.ExternalDoor;
    case "I":
      return TemplateTile.InternalDoor;
  }
  return TemplateTile.Empty;
}

/**
 * Interprets a string as a TemplateRoom. Each line of the input string
 * corresponds to one row of the room. A '#' character places a well, a '.'
 * character places a floor tile, a 'E' character places an external door,
 * which must lead to another floor tile, a 'I' character places an internal
 * door which does not need to lead to a floor tile from another room.
 */
export function parseTemplateRoom(room: string): TemplateRoom {
  let lines = room.split("\n").filter(s => s.length > 0);
  const height = lines.length;
  const width = lines[0].length;
  let tiles = new Array2D<TemplateTile>(height, width);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      tiles.set(y, x, parseTemplateCharacter(lines[y][x]));
    }
  }
  return new TemplateRoom(tiles);
}

/**
 * A room described by a simplified tile array. This is intended mainly for
 * defining 'special' rooms. Each template room contains walls, floors, internal
 * doors, and external doors. At least one external door must be a valid door
 * into the existing level. Upon placement, all valid external doors are placed,
 * and invalid external doors are replaced by walls. Internal doors are always
 * placed.
 */
export class TemplateRoom implements Room {
  constructor(private tiles: Array2D<TemplateTile>) {}

  height() {
    return this.tiles.height;
  }

  width() {
    return this.tiles.width;
  }

  canPlaceAt(tiles: Array2D<Tile>, py: number, px: number): boolean {
    // Rules for TemplateRoom placement:
    // 1. Cannot place any tile on an existing walkable tile.
    // 2. At least one external door must be a valid door.
    const rect = new Rectangle(this.height(), this.width());
    let atLeastOneValidDoor = false;
    for (let c of rect.areaCoords()) {
      const rTile = this.tiles.get(c.y, c.x);
      const wTile = tiles.get(c.y + py, c.x + px);
      if (rTile != TemplateTile.Empty && wTile.hasComponent(WalkableComponent))
        return false;
      if (rTile == TemplateTile.ExternalDoor) {
        if (isValidDoor(tiles, c.y + py, c.x + px)) {
          atLeastOneValidDoor = true;
        }
      }
    }
    return atLeastOneValidDoor;
  }

  placeAt(
    rng: RandomNumberGenerator,
    tiles: Array2D<Tile>,
    py: number,
    px: number
  ): void {
    const rect = new Rectangle(this.height(), this.width());
    // Place all valid external doors in the world
    for (let c of rect.areaCoords()) {
      const ly = c.y + py;
      const lx = c.x + px;
      const isExternalDoor =
        this.tiles.get(c.y, c.x) === TemplateTile.ExternalDoor;
      if (isExternalDoor) {
        if (isValidDoor(tiles, ly, lx)) {
          tiles.set(ly, lx, TILES.makeDoor());
        } else {
          tiles.set(ly, lx, TILES.makeWall());
        }
      }
    }
    // Place all remaining tiles
    for (let c of rect.areaCoords()) {
      const ly = c.y + py;
      const lx = c.x + px;
      switch (this.tiles.get(c.y, c.x)) {
        case TemplateTile.Floor:
          tiles.set(ly, lx, TILES.makeFloor());
          break;
        case TemplateTile.InternalDoor:
          tiles.set(ly, lx, TILES.makeDoor());
          break;
        case TemplateTile.Wall:
          tiles.set(ly, lx, TILES.makeWall());
          break;
      }
    }
  }
}
