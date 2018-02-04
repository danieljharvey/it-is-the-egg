export const tiles = [
  {
    background: true,
    id: 1,
    img: "sky.png",
    needsDraw: true,
    title: "Sky"
  },
  {
    background: false,
    id: 2,
    img: "fabric.png",
    needsDraw: true,
    title: "Fabric"
  },
  {
    background: true,
    collectable: 1,
    frontLayer: true,
    id: 3,
    img: "cacti.png",
    needsDraw: true,
    title: "Cacti"
  },
  {
    background: true,
    collectable: 10,
    frontLayer: true,
    id: 4,
    img: "plant.png",
    needsDraw: true,
    title: "Plant"
  },
  {
    background: false,
    breakable: true,
    id: 5,
    img: "crate.png",
    needsDraw: true,
    title: "Crate"
  },
  {
    background: false,
    id: 8,
    img: "work-surface-2.png",
    needsDraw: true,
    title: "Work surface 2"
  },
  {
    background: false,
    id: 9,
    img: "work-surface-3.png",
    needsDraw: true,
    title: "Work surface 3"
  },
  {
    background: false,
    id: 10,
    img: "work-surface-4.png",
    needsDraw: true,
    title: "Work surface 4"
  },
  {
    background: false,
    id: 11,
    img: "tile.png",
    needsDraw: true,
    title: "Tiles"
  },
  {
    action: "completeLevel",
    background: true,
    createPlayer: "egg",
    frontLayer: true,
    id: 12,
    img: "egg-cup.png",
    needsDraw: true,
    title: "Egg Cup"
  },
  {
    background: true,
    collectable: 100,
    dontAdd: true,
    frontLayer: true,
    id: 13,
    img: "toast.png",
    needsDraw: true,
    title: "Toast"
  },
  {
    action: "teleport",
    background: true,
    frontLayer: true,
    id: 14,
    img: "door.png",
    needsDraw: true,
    title: "Door"
  },
  {
    background: true,
    frontLayer: true,
    id: 15,
    img: "pink-door-open.png",
    needsDraw: true,
    title: "Pink door open"
  },
  {
    background: false,
    id: 16,
    img: "pink-door.png",
    needsDraw: true,
    title: "Pink door closed"
  },
  {
    action: "pink-switch",
    background: true,
    frontLayer: true,
    id: 17,
    img: "pink-switch.png",
    needsDraw: true,
    title: "Pink door switch"
  },
  {
    background: true,
    frontLayer: true,
    id: 18,
    img: "green-door-open.png",
    needsDraw: true,
    title: "Green door open"
  },
  {
    background: false,
    id: 19,
    img: "green-door.png",
    needsDraw: true,
    title: "Green door closed"
  },
  {
    action: "green-switch",
    background: true,
    frontLayer: true,
    id: 20,
    img: "green-switch.png",
    needsDraw: true,
    title: "Green door switch"
  },
  {
    background: true,
    createPlayer: "silver-egg",
    frontLayer: true,
    id: 21,
    img: "silver-egg-cup.png",
    needsDraw: true,
    title: "Silver Egg Cup"
  },
  {
    background: true,
    createPlayer: "blade",
    frontLayer: true,
    id: 22,
    img: "blade-egg-cup.png",
    needsDraw: true,
    title: "Blade egg cup"
  },
  {
    background: true,
    createPlayer: "find-blade",
    frontLayer: true,
    id: 23,
    img: "find-blade-egg-cup.png",
    needsDraw: true,
    title: "Find-blade egg cup"
  },
  {
    background: true,
    id: 24,
    action: "split-eggs",
    needsDraw: true,
    frontLayer: true,
    img: "egg-splitter.png",
    title: "It is the egg splitter"
  }
];

export const getTile = id => {
  return tiles.find(tile => {
    return tile.id === id;
  });
};
