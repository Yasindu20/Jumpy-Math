//tileType to swap the tile sprite in the same mapping depending on the levels 
export function generateMappings(tileType) {
  return {
    0: () => [
      sprite(`${tileType}-tileset`, { anim: "tl" }), //top left tile sprite
      area(), //collision area for the standing
      body({ isStatic: true }), //with true tile will be solid, don't affect with gravity
      offscreen(), //when the tiles out of the screen, removes from rendering for performance
    ],
    1: () => [
      sprite(`${tileType}-tileset`, { anim: "tm" }), //top middle tile sprite
      area(),
      body({ isStatic: true }),
      offscreen(),
    ],
    2: () => [
      sprite(`${tileType}-tileset`, { anim: "tr" }), //top right tile sprite
      area(),
      body({ isStatic: true }),
      offscreen(),
    ],
    3: () => [
      sprite(`${tileType}-tileset`, { anim: "ml" }), //middle left tile sprite
      area(),
      body({ isStatic: true }),
      offscreen(),
    ],
    4: () => [sprite(`${tileType}-tileset`, { anim: "mm" }), offscreen()], //middle middle tile sprite
    5: () => [
      sprite(`${tileType}-tileset`, { anim: "mr" }), //middle right tile sprite
      area(),
      body({ isStatic: true }),
      offscreen(),
    ],
    6: () => [sprite(`${tileType}-tileset`, { anim: "bl" }), offscreen()], //bottom left tile sprite
    7: () => [sprite(`${tileType}-tileset`, { anim: "bm" }), offscreen()], //bottom middle tile sprite
    8: () => [sprite(`${tileType}-tileset`, { anim: "br" }), offscreen()], //bottom right tile sprite

    //mapping One-way platform
    9: () => [
      sprite(`${tileType}-oneway-tileset`, { anim: "tl" }),
      area({ shape: new Rect(vec2(0), 16, 3) }), //Collision area only 3 pixels high with rectagular shape
      "passthrough", // Custom tag for one-way platform
      body({ isStatic: true }),
      offscreen(),
    ],
    a: () => [
      sprite(`${tileType}-oneway-tileset`, { anim: "tm" }),
      area({ shape: new Rect(vec2(0), 16, 3) }),
      "passthrough",
      body({ isStatic: true }),
      offscreen(),
    ],
    b: () => [
      sprite(`${tileType}-oneway-tileset`, { anim: "tr" }),
      area({ shape: new Rect(vec2(0), 16, 3) }),
      "passthrough",
      body({ isStatic: true }),
      offscreen(),
    ],

    //one-way tiles with no collision
    c: () => [
      sprite(`${tileType}-oneway-tileset`, { anim: "ml" }),
      offscreen(),
    ],
    d: () => [
      sprite(`${tileType}-oneway-tileset`, { anim: "mm" }),
      offscreen(),
    ],
    e: () => [
      sprite(`${tileType}-oneway-tileset`, { anim: "mr" }),
      offscreen(),
    ],
    o: () => [sprite("bridge"), area(), body({ isStatic: true }), offscreen()], //mapping for bridge tile
    "@": () => [sprite("coin"), area(), "coin", offscreen()], //mapping for coins
  }
}
