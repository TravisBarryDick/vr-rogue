require("aframe");
require("aframe-orbit-controls");
require("aframe-extras");

import { ComponentDefinition } from "aframe";
import { PreDungeon, PreDungeonGen } from "./PreDungeon/PreDungeonGen";
import { RectangleRoomGenerator } from "./PreDungeon/RectangleRoom";
import { parseTemplateRoom } from "./PreDungeon/TemplateRoom";
import { LCG } from "./RandomNumberGenerator";
import { Rectangle } from "./Rectangle";

const tRoom = parseTemplateRoom(
  `
####^####
#.......#
<.......>
#.......#
###...###
%%#...#%%
%%#...#%%
%%#...#%%
%%##v##%%
`,
  6
);

const oRoom = parseTemplateRoom(
  `
%%%#^#%%%
%%#...#%%
%#.....#%
#.......#
<.......>
#.......#
%#.....#%
%%#...#%%
%%%#v#%%%
`,
  10
);

const sRoom = parseTemplateRoom(
  `
#########
#.......>
#.......#
#..######
#.......#
#.......#
######..#
#.......#
<.......#
#########
`,
  6
);

interface RogueLevel {
  predungeon: PreDungeon;
  createGeometry(): void;
}

AFRAME.registerComponent("rogue-level", <ComponentDefinition<RogueLevel>>{
  init: function() {
    let generator = new PreDungeonGen(
      50,
      50,
      20,
      [
        RectangleRoomGenerator(5, 13, 5, 13, 6),
        () => tRoom,
        () => oRoom,
        () => sRoom
      ],
      [1, 0.1, 0.1, 0.1]
    );
    const seed = Math.floor(Math.random() * 1000);
    this.predungeon = generator.generate(new LCG(seed));
    this.createGeometry();
  },

  createGeometry: function() {
    const rect = new Rectangle(
      this.predungeon.height(),
      this.predungeon.width()
    );
    for (let c of rect.areaCoords()) {
      const aframeEntity = document.createElement("a-entity");
      aframeEntity.setAttribute("position", `${c.x} 0 ${c.y}`);
      if (this.predungeon.isFloor(c.y, c.x)) {
        let floorPlane = document.createElement("a-plane");
        floorPlane.setAttribute("rotation", "-90 0 0");
        floorPlane.setAttribute("color", "brown");
        floorPlane.setAttribute("roughness", 1);
        aframeEntity.appendChild(floorPlane);
        this.el.appendChild(aframeEntity);
      } else if (this.predungeon.isFloorAdjacent(c.y, c.x)) {
        let wallBox = document.createElement("a-box");
        wallBox.setAttribute("height", "1");
        wallBox.setAttribute("position", "0 0.5 0");
        wallBox.setAttribute("material", "src", "#wall");
        wallBox.setAttribute("repeat", "1 1");
        wallBox.setAttribute("roughness", 1);
        wallBox.setAttribute("metalness", 0);
        aframeEntity.appendChild(wallBox);
        this.el.appendChild(aframeEntity);
      }
    }
  }
});
