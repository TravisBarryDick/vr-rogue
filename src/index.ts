require("aframe");
require("aframe-orbit-controls");
require("aframe-extras");

import { ComponentDefinition } from "aframe";
import { Level } from "./Level";
import { LevelGenerator } from "./LevelGeneration/LevelGeneration";
import { RectangleRoomGenerator } from "./LevelGeneration/RectangularRoom";
import { parseTemplateRoom } from "./LevelGeneration/TemplateRoom";
import { LCG } from "./RandomNumberGenerator";
import { Rectangle } from "./Rectangle";

const tRoom = parseTemplateRoom(`
####E####
#.......#
E..#I#..E
#.##.##.#
###...###
%%#...#%%
%%#...#%%
%%#...#%%
%%##E##%%
`);

const oRoom = parseTemplateRoom(`
%%%#E#%%%
%%#...#%%
%#.....#%
#.......#
E.......E
#.......#
%#.....#%
%%#...#%%
%%%#E#%%%
`);

const sRoom = parseTemplateRoom(`
#########
#.......E
#.......#
#..######
#.......#
#.......#
######..#
#.......#
E.......#
#########
`);

const vRoom = parseTemplateRoom(`
####%####
#..###..#
##..#..##
%##...##%
%%##.##%%
%%%#E#%%%
`);

interface RogueLevel {
  level: Level;
  createGeometry(): void;
}

AFRAME.registerComponent("rogue-level", <ComponentDefinition<RogueLevel>>{
  init: function() {
    let generator = new LevelGenerator(
      50,
      50,
      20,
      [
        RectangleRoomGenerator(4, 10, 4, 10),
        () => tRoom,
        () => oRoom,
        () => sRoom,
        () => vRoom
      ],
      [5, 1, 1, 1, 0.5]
    );
    const seed = Math.floor(Math.random() * 1000);
    this.level = generator.generate(new LCG(seed));
    this.createGeometry();
  },

  createGeometry: function() {
    const rect = new Rectangle(this.level.height(), this.level.width());
    for (let c of rect.areaCoords()) {
      const aframeEntity = document.createElement("a-entity");
      aframeEntity.setAttribute("position", `${c.x} 0 ${c.y}`);
      this.level.tiles.get(c.y, c.x).aframeInit(aframeEntity);
      this.el.appendChild(aframeEntity);
    }
  }
});
