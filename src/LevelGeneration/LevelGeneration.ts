// This level generation algorithm works by repeatedly placing randomly
// generated rooms in the level. The high level outline is as follows:
//
//   1. Until we've added enough rooms, repeat the following:
//     2. Choose a room generator at random.
//     3. Use that generator to create a new room.
//     4. "Slide" that room across the map and record all valid positions.
//     5. If there is at least one valid position, pick one at random and add
//        the room.
//
// A few details:
//
//  - Rooms implement the Room interface, which defines the room size, rules for
//    determining the valid positions of that room, and a procedure for
//    realizing the room.
//
//  - A RoomGen (short for Room Generator) is a function that takes a random
//    number generator and returns a room instance.
//
//  - The LevelGenerator can also be given a vector of weights, one for each
//    RoomGen. The probability of selecting a given generator is proportional
//    to its weight.
//
//  - Level connectivity: The algorithm has no explicit rules for ensuring that
//    the level is connected. However, if all rooms guarantee that any "valid"
//    position is one where that room is reachable from the current set of tiles
//    then the final level will be connected.

import { Array2D } from "../Array2D";
import { Level } from "../Level";
import { Tile, FloorComponent, WalkableComponent, TILES } from "../Tile";
import { RandomNumberGenerator } from "../RandomNumberGenerator";
import { discreteSample, randomChoice } from "../Utils";
import { Rectangle } from "../Rectangle";

//////////////////
// --- Room --- //
//////////////////

export interface Room {
  /** The height of the room's bounding box */
  height(): number;

  /** The width of the room's bounding box */
  width(): number;

  /**
   * Tests whether the room can be placed at position (y,x) in the given tile
   * array
   */
  canPlaceAt(tiles: Array2D<Tile>, y: number, x: number): boolean;

  /**
   * Places the room at position (y,x) in the given tile array
   */
  placeAt(
    rng: RandomNumberGenerator,
    tiles: Array2D<Tile>,
    y: number,
    x: number
  ): void;
}

/////////////////////
// --- RoomGen --- //
/////////////////////

/**
 * A function mapping a random number generator to a Room instance
 */
export interface RoomGen {
  (rng: RandomNumberGenerator): Room;
}

/////////////////////////////
// --- Level Generator --- //
/////////////////////////////

/**
 * A configurable random level generator. The configurable parameters are:
 * - height, width: Dimensions of the level.
 * - maxRooms: The number of times to attempt to place a room.
 * - roomGens: A list of room generator functions used to generate each room.
 * - weights: An optional array of weights, one for each room generator. The
 *            probability of selecting the ith RoomGen is proportional to the
 *            ith weight.
 *
 * See the beginning of the file for a description of the level generation
 * algorithm.
 */
export class LevelGenerator {
  constructor(
    private height: number,
    private width: number,
    private maxRooms: number,
    private roomGens: Array<RoomGen>,
    private weights?: Array<number>
  ) {
    // If weights were not provided, give rooms equal weight
    if (weights == null) {
      this.weights = roomGens.map(() => 1.0);
    }
  }

  /** Generates the next room to place in the level */
  private chooseRoom(rng: RandomNumberGenerator): Room {
    const ix = discreteSample(rng, this.weights);
    return this.roomGens[ix](rng);
  }

  /** Generates a random level */
  generate(this: LevelGenerator, rng: RandomNumberGenerator): Level {
    let tiles = Array2D.comprehension<Tile>(
      this.height,
      this.width,
      () => new Tile()
    );
    let room = this.chooseRoom(rng);
    this.addRoom(rng, tiles, room, true);
    for (let i = 1; i < this.maxRooms; i++) {
      let room = this.chooseRoom(rng);
      this.addRoom(rng, tiles, room);
    }
    this.addRandomStartEnd(rng, tiles);
    return Level.LevelFromTiles(tiles);
  }

  /**
   * Attempts to place the room `r` in the level by considering all possible
   * positions. Returns true if the room was placed and false if there were no
   * valid positions. If there are multiple valid positions, places the room at
   * a randomly chosen valid position.
   */
  private addRoom(
    rng: RandomNumberGenerator,
    tiles: Array2D<Tile>,
    r: Room,
    forceValid: boolean = false
  ): boolean {
    // Find all positions where the room can be placed
    let validPositions = new Array<[number, number]>();
    for (let y = 0; y + r.height() < tiles.height; y++) {
      for (let x = 0; x + r.width() < tiles.width; x++) {
        if (forceValid || r.canPlaceAt(tiles, y, x)) {
          validPositions.push([y, x]);
        }
      }
    }
    // If there were no valid room positions, return false.
    if (validPositions.length === 0) {
      return false;
    }
    // Otherwise, choose a valid position and place the room there.
    let [y, x] = randomChoice(rng, validPositions);
    r.placeAt(rng, tiles, y, x);
    return true;
  }

  addRandomStartEnd(rng: RandomNumberGenerator, tiles: Array2D<Tile>) {
    let walkables = new Array<{y: number, x: number}>();
    for (let c of new Rectangle(tiles.height, tiles.width).areaCoords()) {
      const tile = tiles.get(c.y, c.x);
      if (tile.hasComponent(WalkableComponent)) {
        walkables.push({...c});
      }
    }
    const start = randomChoice(rng, walkables);
    walkables = walkables.filter(t => t !== start);
    const end = randomChoice(rng, walkables);
    tiles.set(start.y, start.x, TILES.makeStart());
    tiles.set(end.y, end.x, TILES.makeEnd());
  }
}

//////////////////////////////
// --- Helper Functions --- //
//////////////////////////////

/**
 * Tests whether or not the (y,x) position is a 'valid door' in the tile array.
 * A position is a 'valid door' if it is adjacent to at least one walkable tile.
 */
export function isValidDoor(
  tiles: Array2D<Tile>,
  y: number,
  x: number
): boolean {
  return (
    (y > 0 && tiles.get(y - 1, x).hasComponent(FloorComponent)) ||
    (y < tiles.height - 1 &&
      tiles.get(y + 1, x).hasComponent(FloorComponent)) ||
    (x > 0 && tiles.get(y, x - 1).hasComponent(FloorComponent)) ||
    (x < tiles.width - 1 && tiles.get(y, x + 1).hasComponent(FloorComponent))
  );
}
