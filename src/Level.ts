import { Array2D } from "./Array2D";
import { Rectangle } from "./Rectangle";

export enum Tile {
  Empty,
  Floor,
  Wall,
  Door
}

export function tile2char(t: Tile) {
  switch (t) {
    case Tile.Empty:
      return " ";
    case Tile.Floor:
      return ".";
    case Tile.Wall:
      return "#";
    case Tile.Door:
      return "=";
  }
}

export class Level {
  tiles: Array2D<Tile>;

  static LevelFromTiles(tiles: Array2D<Tile>) {
    let l = new Level(0, 0);
    l.tiles = tiles;
    return l;
  }

  /** Constructs an empty level of the given width and height */
  constructor(height: number, width: number) {
    this.tiles = new Array2D<Tile>(height, width, Tile.Empty);
  }

  /** Returns a string representation of the level */
  toString(): string {
    return this.tiles.toString(tile2char);
  }

  /** Returns the width of the level */
  width(): number {
    return this.tiles.width;
  }

  /** Returns the height of the level */
  height(): number {
    return this.tiles.height;
  }

  midpoint(): { y: number; x: number } {
    let miny = this.height() - 1;
    let maxy = 0;
    let minx = this.width() - 1;
    let maxx = 0;
    const levelRect = new Rectangle(this.height(), this.width());
    for (let c of levelRect.areaCoords()) {
      if (this.tiles.get(c.y, c.x) != Tile.Empty) {
        miny = Math.min(miny, c.y);
        maxy = Math.max(maxy, c.y);
        minx = Math.min(minx, c.x);
        maxx = Math.max(maxx, c.x);
      }
    }
    return { y: (miny + maxy) / 2, x: (minx + maxx) / 2 };
  }
}
