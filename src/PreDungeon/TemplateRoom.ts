import { Array2D } from "../Array2D";
import { isValidHallray, placeHallray, hallrayLength } from "./Hallways";
import { PreDungeon, Room } from "./PreDungeonGen";
import { RandomNumberGenerator } from "../RandomNumberGenerator";
import { Rectangle } from "../Rectangle";

/**
 * A simplified tile set used for room templates.
 */
enum TemplateTile {
  Empty,
  Wall,
  Floor,
  HallwayNorth,
  HallwaySouth,
  HallwayWest,
  HallwayEast
}

function getHallwayDir(t: TemplateTile): { y: number; x: number } {
  switch (t) {
    case TemplateTile.HallwayNorth:
      return { y: -1, x: 0 };
    case TemplateTile.HallwaySouth:
      return { y: 1, x: 0 };
    case TemplateTile.HallwayWest:
      return { y: 0, x: -1 };
    case TemplateTile.HallwayEast:
      return { y: 0, x: 1 };
  }
}

function isHallway(t: TemplateTile) {
  return (
    t === TemplateTile.HallwayNorth ||
    t === TemplateTile.HallwaySouth ||
    t === TemplateTile.HallwayWest ||
    t === TemplateTile.HallwayEast
  );
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
    case "^":
      return TemplateTile.HallwayNorth;
    case "v":
      return TemplateTile.HallwaySouth;
    case "<":
      return TemplateTile.HallwayWest;
    case ">":
      return TemplateTile.HallwayEast;
  }
  return TemplateTile.Empty;
}

/**
 * Interprets a string as a TemplateRoom. Each line of the input string
 * corresponds to one row of the room. A '#' character places a wall, a '.'
 * character places a floor tile, and characters '^', 'v', '<', '>' places a
 * potential hallway starting point and direction.
 */
export function parseTemplateRoom(
  room: string,
  maxHallwayLength: number = 1
): TemplateRoom {
  let lines = room.split("\n").filter(s => s.length > 0);
  const height = lines.length;
  const width = lines[0].length;
  let tiles = new Array2D<TemplateTile>(height, width);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      tiles.set(y, x, parseTemplateCharacter(lines[y][x]));
    }
  }
  return new TemplateRoom(tiles, maxHallwayLength);
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
  constructor(
    private tiles: Array2D<TemplateTile>,
    private _maxHallwayLength: number
  ) {}

  height() {
    return this.tiles.height;
  }

  width() {
    return this.tiles.width;
  }

  maxHallwayLength() {
    return this._maxHallwayLength;
  }

  canPlaceAt(predungeon: PreDungeon, py: number, px: number): boolean {
    // Rules for TemplateRoom placement:
    // 1. No non-empty tile in the template can be on a walkable tile
    // 2. At least one hallway must connect to the current pre-dungeon
    const rect = new Rectangle(this.height(), this.width());
    let atLeastOneValidHallway = false;
    for (let c of rect.areaCoords()) {
      const ly = c.y + py;
      const lx = c.x + px;
      const t = this.tiles.get(c.y, c.x);
      if (t !== TemplateTile.Empty && predungeon.isFloor(ly, lx)) return false;
      if (isHallway(t)) {
        const dir = getHallwayDir(t);
        if (isValidHallray(predungeon, ly, lx, dir, this.maxHallwayLength())) {
          atLeastOneValidHallway = true;
        }
      }
    }
    return atLeastOneValidHallway;
  }

  placeAt(
    _rng: RandomNumberGenerator,
    predungeon: PreDungeon,
    py: number,
    px: number
  ): void {
    const rect = new Rectangle(this.height(), this.width());
    // Place all valid external doors
    for (let c of rect.areaCoords()) {
      const ly = c.y + py;
      const lx = c.x + px;
      const t = this.tiles.get(c.y, c.x);
      if (isHallway(t)) {
        const dir = getHallwayDir(t);
        if (isValidHallray(predungeon, ly, lx, dir, this.maxHallwayLength())) {
          const len = hallrayLength(predungeon, ly, lx, dir);
          placeHallray(predungeon, ly, lx, dir, len);
        }
      }
    }
    // Place floor tiles
    for (let c of rect.areaCoords()) {
      const ly = c.y + py;
      const lx = c.x + px;
      if (this.tiles.get(c.y, c.x) === TemplateTile.Floor) {
        predungeon.setFloor(ly, lx);
      }
    }
  }
}
