// This pre-dungeon generation algorithm works by repeatedly placing randomly
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
//  - The PreDungeonGen can also be given a vector of weights, one for each
//    RoomGen. The probability of selecting a given generator is proportional
//    to its weight.
//
//  - Pre-dungeon connectivity: The algorithm has no explicit rules for ensuring
//    that the level is connected. However, if all rooms guarantee that any
//    "valid" position is one where that room is reachable from the current set
//    walkable tiles then the final level will be connected.

import { Array2D } from "../Array2D";
import { RandomNumberGenerator } from "../RandomNumberGenerator";
import { discreteSample, randomChoice } from "../Utils";
import { Rectangle } from "../Rectangle";

/**
 * A PreDungeon describes what tiles are walkable or not and is used to generate
 * the shape of each level. We call walkable tiles "floors" and non-walkable
 * tiles "walls".
 */
export class PreDungeon {
  private walkable: Array2D<boolean>;

  /** Creates a new PreDungeon completely filled with walls */
  constructor(height: number, width: number) {
    this.walkable = new Array2D<boolean>(height, width, false);
  }

  /** Returns the height of the PreDungeon's bounding box */
  height() {
    return this.walkable.height;
  }

  /** Returns the width of the PreDungeon's bounding box */
  width() {
    return this.walkable.width;
  }

  /** Checks if the coordinate at (y,x) is a floor */
  isFloor(y: number, x: number): boolean {
    return this.walkable.get(y, x);
  }

  /** Checks if the coordinate at (y,x) is a wall */
  isWall(y: number, x: number): boolean {
    return !this.isFloor(y, x);
  }

  /** Sets there to be a floor at the coordinate (y,x) */
  setFloor(y: number, x: number) {
    this.walkable.set(y, x, true);
  }

  /** Sets there to be a wall at the coordinate (y, x) */
  setWall(y: number, x: number) {
    this.walkable.set(y, x, false);
  }

  /**
   * Tests whether the given coordinates belong to the PreDungeon bounding box
   */
  inBounds(y: number, x: number) {
    return this.walkable.inBounds(y, x);
  }

  /**
   * Returns true if there is a floor tile adjacent to the coordinate (y,x)
   */
  isFloorAdjacent(this: PreDungeon, y: number, x: number): boolean {
    return (
      (y > 0 && this.isFloor(y - 1, x)) ||
      (y < this.height() && this.isFloor(y + 1, x)) ||
      (x > 0 && this.isFloor(y, x - 1)) ||
      (x < this.width() - 1 && this.isFloor(y, x + 1))
    );
  }
}

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
  canPlaceAt(predungeon: PreDungeon, y: number, x: number): boolean;

  /**
   * Places the room at position (y,x) in the given tile array
   */
  placeAt(
    rng: RandomNumberGenerator,
    predungeon: PreDungeon,
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

///////////////////////////////////
// --- Pre-Dungeon Generator --- //
///////////////////////////////////

/**
 * A configurable pre-dungeon generator. The configurable parameters are:
 * - height, width: Dimensions of the pre-dungeon.
 * - maxRooms: The number of times to attempt to place a room.
 * - roomGens: A list of room generator functions used to generate each room.
 * - weights: An optional array of weights, one for each room generator. The
 *            probability of selecting the ith RoomGen is proportional to the
 *            ith weight.
 *
 * See the beginning of the file for a description of the pre-dungeon generation
 * algorithm.
 */
export class PreDungeonGen {
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

  /** Generates the next room to place in the pre-dungeon */
  private chooseRoom(rng: RandomNumberGenerator): Room {
    const ix = discreteSample(rng, this.weights);
    return this.roomGens[ix](rng);
  }

  /** Generates a random pre-dungeon */
  generate(this: PreDungeonGen, rng: RandomNumberGenerator): PreDungeon {
    let predungeon = new PreDungeon(this.width, this.height);
    let room = this.chooseRoom(rng);
    this.addRoom(rng, predungeon, room, true);
    for (let i = 1; i < this.maxRooms; i++) {
      let room = this.chooseRoom(rng);
      this.addRoom(rng, predungeon, room);
    }
    return predungeon;
  }

  /**
   * Attempts to place the room `r` in the pre-dungeon by considering all
   * possible positions. Returns true if the room was placed and false if there
   * were no valid positions. If there are multiple valid positions, places the
   * room at a randomly chosen valid position.
   */
  private addRoom(
    rng: RandomNumberGenerator,
    predungeon: PreDungeon,
    r: Room,
    forceValid: boolean = false
  ): boolean {
    const rect = new Rectangle(
      predungeon.height() - r.height(),
      predungeon.width() - r.width()
    );
    // Find all positions where the room can be placed
    let validPositions = new Array<{ y: number; x: number }>();
    for (let c of rect.areaCoords()) {
      if (forceValid || r.canPlaceAt(predungeon, c.y, c.x)) {
        validPositions.push!({ ...c });
      }
    }
    // If there were no valid room positions, return false.
    if (validPositions.length === 0) {
      return false;
    }
    // Otherwise, choose a valid position and place the room there.
    let position = randomChoice(rng, validPositions);
    r.placeAt(rng, predungeon, position.y, position.x);
    return true;
  }
}
