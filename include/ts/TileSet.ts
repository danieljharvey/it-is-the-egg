export class TileSet {
  public static getTiles() {
    const tiles = {
      1: {
        background: true,
        id: 1,
        img: "sky.png",
        needsDraw: true,
        title: "Sky"
      },
      2: {
        background: false,
        id: 2,
        img: "fabric.png",
        needsDraw: true,
        title: "Fabric"
      },
      3: {
        background: true,
        collectable: 1,
        frontLayer: true,
        id: 3,
        img: "cacti.png",
        needsDraw: true,
        title: "Cacti"
      },
      4: {
        background: true,
        collectable: 10,
        frontLayer: true,
        id: 4,
        img: "plant.png",
        needsDraw: true,
        title: "Plant"
      },
      5: {
        background: false,
        breakable: true,
        id: 5,
        img: "crate.png",
        needsDraw: true,
        title: "Crate"
      },
      8: {
        background: false,
        id: 8,
        img: "work-surface-2.png",
        needsDraw: true,
        title: "Work surface 2"
      },
      9: {
        background: false,
        id: 9,
        img: "work-surface-3.png",
        needsDraw: true,
        title: "Work surface 3"
      },
      10: {
        background: false,
        id: 10,
        img: "work-surface-4.png",
        needsDraw: true,
        title: "Work surface 4"
      },
      11: {
        background: false,
        id: 11,
        img: "tile.png",
        needsDraw: true,
        title: "Tiles"
      },
      12: {
        action: "completeLevel",
        background: true,
        createPlayer: "egg",
        frontLayer: true,
        id: 12,
        img: "egg-cup.png",
        needsDraw: true,
        title: "Egg Cup"
      },
      13: {
        background: true,
        collectable: 100,
        dontAdd: true,
        frontLayer: true,
        id: 13,
        img: "toast.png",
        needsDraw: true,
        title: "Toast"
      },
      14: {
        action: "teleport",
        background: true,
        frontLayer: true,
        id: 14,
        img: "door.png",
        needsDraw: true,
        title: "Door"
      },
      15: {
        background: true,
        frontLayer: true,
        id: 15,
        img: "pink-door-open.png",
        needsDraw: true,
        title: "Pink door open"
      },
      16: {
        background: false,
        id: 16,
        img: "pink-door.png",
        needsDraw: true,
        title: "Pink door closed"
      },
      17: {
        action: "pink-switch",
        background: true,
        frontLayer: true,
        id: 17,
        img: "pink-switch.png",
        needsDraw: true,
        title: "Pink door switch"
      },
      18: {
        background: true,
        frontLayer: true,
        id: 18,
        img: "green-door-open.png",
        needsDraw: true,
        title: "Green door open"
      },
      19: {
        background: false,
        id: 19,
        img: "green-door.png",
        needsDraw: true,
        title: "Green door closed"
      },
      20: {
        action: "green-switch",
        background: true,
        frontLayer: true,
        id: 20,
        img: "green-switch.png",
        needsDraw: true,
        title: "Green door switch"
      },
      21: {
        background: true,
        createPlayer: "silver-egg",
        frontLayer: true,
        id: 21,
        img: "silver-egg-cup.png",
        needsDraw: true,
        title: "Silver Egg Cup"
      },
      22: {
        background: true,
        createPlayer: "blade",
        frontLayer: true,
        id: 22,
        img: "blade-egg-cup.png",
        needsDraw: true,
        title: "Blade egg cup"
      },
      23: {
        background: true,
        createPlayer: "find-blade",
        frontLayer: true,
        id: 23,
        img: "find-blade-egg-cup.png",
        needsDraw: true,
        title: "Find-blade egg cup"
      },
      24: {
        background: true,
        id: 24,
        action: "split-eggs",
        needsDraw: true,
        frontLayer: true,
        title: "It is the egg splitter"
      }
    };
    // return a copy rather than letting this get messed with
    return JSON.parse(JSON.stringify(tiles));
  }

  public static getTile(id) {
    const tiles = TileSet.getTiles();
    if (tiles.hasOwnProperty(id)) {
      return tiles[id];
    }
    return false;
  }
}
