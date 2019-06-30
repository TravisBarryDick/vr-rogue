// Levels are described by an Array2D of tiles, where each tile encodes the
// properties of a small region in the level. Tiles make use of the
// entity-component pattern, where the behavior of a given tile is almost
// entirely determined by a collection of TileComponents. For example,
// TileComponents can be used to:
//
// - Add visual effects such as 3D models or lights to the scene.
// - Determine whether the player can walk on the tile.
// - React to player actions (e.g., opening/closing doors, activating traps).

import { Entity } from "aframe";

/**
 * Encodes one component of a Tile.
 * Note: If a TileComponent has no internal state, then a single instance can
 *       be shared across many tiles. For example, we only need one 'Walkable'
 *       component instance.
 */
export abstract class TileComponent {
  /** Returns a unique identifier for this component */
  abstract getId(): string;

  /** Called when the tile component is added to a tile */
  onAdded(tile: Tile): void {}

  /** Called when the tile component is removed from a tile */
  onRemoved(tile: Tile): void {}

  /**
   * Called when the aframe entity for this tile is created. This is a good
   * time to edit the a-frame scene graph.
   */
  aframeInit(tile: Tile): void {}
}

export class Tile {
  aframeEntity: Entity;
  components: Map<string, TileComponent>;

  constructor() {
    this.components = new Map<string, TileComponent>();
  }

  addComponent(component: TileComponent) {
    if (!this.components.has(component.getId())) {
      this.components.set(component.getId(), component);
      component.onAdded(this);
      if (this.aframeEntity != null) {
        component.aframeInit(this);
      }
      return this;
    }
  }

  removeComponent(component: TileComponent) {
    if (this.components.has(component.getId())) {
      this.components.delete(component.getId());
      component.onRemoved(this);
      return this;
    }
  }

  hasComponent(component: TileComponent): boolean {
    return this.components.has(component.getId());
  }

  aframeInit(aframeEntity: Entity) {
    this.aframeEntity = aframeEntity;
    for (let c of this.components.values()) c.aframeInit(this);
  }

  isEmpty(): boolean {
    return this.components.size === 0;
  }
}

////////////////////////
// --- Components --- //
////////////////////////

// --- WallComponent --- //

export const WallComponent = new (class extends TileComponent {
  getId() {
    return "Wall";
  }

  aframeInit(tile: Tile) {
    let wallBox = document.createElement("a-box");
    wallBox.setAttribute("height", "1");
    wallBox.setAttribute("position", "0 0.5 0");
    wallBox.setAttribute("material", "src", "#wall");
    wallBox.setAttribute("repeat", "1 1");
    wallBox.setAttribute("roughness", 1);
    wallBox.setAttribute("metalness", 0);
    tile.aframeEntity.appendChild(wallBox);
  }
})();

// --- FloorComponent --- //

export const FloorComponent = new (class extends TileComponent {
  getId() {
    return "Floor";
  }
  aframeInit(tile: Tile) {
    let floorPlane = document.createElement("a-plane");
    floorPlane.setAttribute("rotation", "-90 0 0");
    floorPlane.setAttribute("color", "brown");
    floorPlane.setAttribute("roughness", 1);
    tile.aframeEntity.appendChild(floorPlane);
  }
})();

// --- DoorComponent --- //

export const DoorComponent = new (class extends TileComponent {
  getId() {
    return "Door";
  }

  aframeInit(tile: Tile) {
    let floorPlane = document.createElement("a-plane");
    floorPlane.setAttribute("rotation", "-90 0 0");
    floorPlane.setAttribute("color", "green");
    floorPlane.setAttribute("roughness", 1);
    tile.aframeEntity.appendChild(floorPlane);
  }
})();

// --- WalkableComponent --- //

export const WalkableComponent = new (class extends TileComponent {
  getId() {
    return "Walkable";
  }
})();

////////////////////////////
// --- Standard Tiles --- //
////////////////////////////

export const TILES = {
  makeWall() {
    return new Tile().addComponent(WallComponent);
  },

  makeFloor() {
    return new Tile()
      .addComponent(FloorComponent)
      .addComponent(WalkableComponent);
  },

  makeDoor() {
    return new Tile()
      .addComponent(DoorComponent)
      .addComponent(WalkableComponent);
  }
};
