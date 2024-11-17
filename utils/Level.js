export class Level {
  //Draw waves
  drawWaves(type, anim) {
    let offset = -100
    for (let i = 0; i < 21; i++) {
      add([sprite(type, { anim }), pos(offset, 600), scale(4), fixed()])
      offset += 64
    }
  }

  //Method to draw the main map layout of the level
  drawMapLayout(levelLayout, mappings) {
    const layerSettings = {
      tileWidth: 16, //Width
      tileHeight: 12, //Height
      tiles: mappings, //property for mapping each tiles
    }

    //empty arrays to store each map layer
    this.map = []
    //To access single array at a time
    for (const layerLayout of levelLayout) {
      this.map.push(addLevel(layerLayout, layerSettings)) //draw the map into the screen
    }

    for (const layer of this.map) {
      layer.use(scale(4))
    }
  }

  // Method to draw the background of the level
  drawBackground(bgSpriteName) {
    add([sprite(bgSpriteName), fixed(), scale(4)]) //Keeps the background sprite in a fixed position on the screen
  }
}
