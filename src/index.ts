require("aframe");
require("aframe-orbit-controls");
require("aframe-extras");

import { ComponentDefinition } from "aframe";
import { Tile, Level } from "./Level";
import { LevelGenerator } from "./LevelGeneration/LevelGeneration";
import { RectangleRoomGenerator } from "./LevelGeneration/RectangularRoom";
import { parseTemplateRoom } from "./LevelGeneration/TemplateRoom";
import { LCG } from "./RandomNumberGenerator";

const tRoom = parseTemplateRoom(`
####=####
=.......=
####.####
%%%#.#%%%
%%%#.#%%%
%%%#.#%%%
%%%#=#%%%
`);

const oRoom = parseTemplateRoom(`
%%%#=#%%%
%%#...#%%
%#.....#%
#.......#
=.......=
#.......#
%#.....#%
%%#...#%%
%%%#=#%%%
`);

interface RogueLevel {
  level: Level;
  createGeometry(): void;
}

AFRAME.registerComponent("rogue-level", <ComponentDefinition<RogueLevel>>{
  init: function() {
    let generator = new LevelGenerator(50, 50, 15, [
      RectangleRoomGenerator(4, 10, 4, 10),
      () => tRoom,
      () => oRoom
    ], [3, 1, 1]);
    const seed = Math.floor(Math.random() * 1000);
    this.level = generator.generate(new LCG(seed), true);
    this.createGeometry();
  },

  createGeometry: function() {
    for (let y = 0; y < this.level.height(); y++) {
      for (let x = 0; x < this.level.width(); x++) {
        const tile = this.level.tiles.get(y, x);
        if (tile === Tile.Wall) {
          let wallBox = document.createElement("a-box");
          wallBox.setAttribute("position", `${x} 1 ${y}`);
          wallBox.setAttribute("height", "2");
          wallBox.setAttribute("material", "src", "#wall");
          wallBox.setAttribute("repeat", "1 2");
          wallBox.setAttribute("roughness", 1);
          this.el.appendChild(wallBox);
        } else if (tile === Tile.Floor || tile === Tile.Door) {
          let floorPlane = document.createElement("a-plane");
          floorPlane.setAttribute("position", `${x} 0 ${y}`);
          floorPlane.setAttribute("rotation", "-90 0 0");
          //floorPlane.setAttribute("material", "src", "#floor");
          floorPlane.setAttribute("color", "brown");
          floorPlane.setAttribute("roughness", 1);
          this.el.appendChild(floorPlane);
        }
      }
    }
  }
});
