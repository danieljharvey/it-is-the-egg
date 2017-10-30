export class PlayerTypes {
  protected playerTypes: object = {
    "blue-egg": {
      frames: 18,
      img: "egg-sprite-blue.png",
      multiplier: 5,
      title: "It is of course the blue egg",
      type: "blue-egg",
      value: 3
    },
    egg: {
      frames: 18,
      img: "egg-sprite.png",
      multiplier: 1,
      title: "It is of course the egg",
      type: "egg",
      value: 1
    },
    "red-egg": {
      frames: 18,
      img: "egg-sprite-red.png",
      multiplier: 2,
      title: "It is of course the red egg",
      type: "red-egg",
      value: 2
    },
    "silver-egg": {
      fallSpeed: 20,
      frames: 1,
      img: "silver-egg.png",
      moveSpeed: 0,
      multiplier: 10,
      title: "It is of course the silver egg",
      type: "silver-egg",
      value: 0
    },
    "yellow-egg": {
      frames: 18,
      img: "egg-sprite-yellow.png",
      multiplier: 10,
      title: "It is of course the yellow egg",
      type: "yellow-egg",
      value: 4
    }
  };

  public getPlayerTypes() {
    return this.playerTypes;
  }
}
