import { isValidHallray, placeHallray, hallrayLength } from "./Hallways";
import { PreDungeon, Room, RoomGen } from "./PreDungeonGen";
import { randomChoice } from "../Utils";
import { RandomNumberGenerator } from "../RandomNumberGenerator";
import { Rectangle } from "../Rectangle";

/**
 * Given a coordinate on the boundary of a rectangle, returns the direction that
 * is normal to the line segment containing the coordinate. This is used to
 * determine the direction of hallways from rectangular rooms.
 */
export function getHallwayDir(rect: Rectangle, c: { y: number; x: number }) {
  if (c.y === rect.y) {
    return { y: -1, x: 0 };
  } else if (c.y === rect.y + rect.height - 1) {
    return { y: 1, x: 0 };
  } else if (c.x === rect.x) {
    return { y: 0, x: -1 };
  } else if (c.x === rect.x + rect.width - 1) {
    return { y: 0, x: 1 };
  }
}

/**
 * A rectangular room with one door. The width and height parameters describe
 * the size of the room, including the boundary wall. When the room is placed
 * in the pre-dungeon, no point in the bounding rectangle can already be
 * walkable, and at least one non-corner tile from the perimeter of the bounding
 * rectangle must be adjacent to an existing walkable tile.
 */
export class RectangleRoom implements Room {
  constructor(
    private _height: number,
    private _width: number,
    private _maxHallwayLength: number
  ) {}

  height() {
    return this._height;
  }

  width() {
    return this._width;
  }

  maxHallwayLength() {
    return this._maxHallwayLength;
  }

  canPlaceAt(predungeon: PreDungeon, py: number, px: number): boolean {
    // Rules for RectangleRoom Placement:
    // 1. Must not overlap with any walkable tile already in the level
    // 2. There must be at least one valid hallway for the room
    const rect = new Rectangle(this.height(), this.width(), py, px);
    // Check to make sure we don't overlap with any existing floor tiles.
    for (let c of rect.areaCoords()) {
      if (predungeon.isFloor(c.y, c.x)) return false;
    }
    // Check to make sure there is at least one valid door
    let atLeastOneHallway = false;
    for (let c of rect.perimeterCoords(1)) {
      const dir = getHallwayDir(rect, c);
      if (isValidHallray(predungeon, c.y, c.x, dir, this.maxHallwayLength())) {
        atLeastOneHallway = true;
      }
    }
    return atLeastOneHallway;
  }

  placeAt(
    rng: RandomNumberGenerator,
    predungeon: PreDungeon,
    py: number,
    px: number
  ): void {
    const rect = new Rectangle(this.height(), this.width(), py, px);
    // Place door
    let validHallwayStarts = Array<{ y: number; x: number }>();
    for (let c of rect.perimeterCoords(1)) {
      const dir = getHallwayDir(rect, c);
      if (isValidHallray(predungeon, c.y, c.x, dir, this.maxHallwayLength())) {
        validHallwayStarts.push({ ...c });
      }
    }
    if (validHallwayStarts.length > 0) {
      let c = randomChoice(rng, validHallwayStarts);
      const dir = getHallwayDir(rect, c);
      const len = hallrayLength(predungeon, c.y, c.x, dir);
      placeHallray(predungeon, c.y, c.x, dir, len);
    }
    // Place floor tiles
    for (let c of rect.enlarge(-2, -2).areaCoords()) {
      predungeon.setFloor(c.y, c.x);
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
  maxWidth: number,
  maxHallwayLength: number
): RoomGen {
  return rng => {
    const h = Math.floor(rng.next() * (maxHeight - minHeight)) + minHeight;
    const w = Math.floor(rng.next() * (maxWidth - minWidth)) + minWidth;
    return new RectangleRoom(h, w, maxHallwayLength);
  };
}
