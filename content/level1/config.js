export const level1Config = {
  gravity: 1400, //Gravity applied to all entities in the level
  playerSpeed: 400, //Player's horizontal movement speed
  jumpForce: 650, //Player's jump strength
  nbLives: 3, //number of lives
  playerStartPosX: 1500, //Starting X position of the player
  playerStartPosY: 100, //Starting Y position of the player

  //Positions of each fish
  fishPositions: [
    () => vec2(2595, 600),
    () => vec2(2655, 600),
    () => vec2(4100, 600),
    () => vec2(4220, 800),
    () => vec2(5200, 800),
    () => vec2(5300, 800),
  ],
  //range of vertical movement for fish
  fishAmplitudes: [300, 500, 400, 500, 900, 800],
  fishType: 1,

  //Positions of each spider
  //we can use vector to pass in array, because Kaboom doesn't exist here
  spiderPositions: [
    () => vec2(2000, 300), // Spider 1 position
    () => vec2(2520, 0),   // Spider 2 position
    () => vec2(3200, 200), // Spider 3 position
    () => vec2(3500, 300), // Spider 4 position
  ],
  spiderAmplitudes: [300, 150, 150, 300], //range of movement for spider
  spiderSpeeds: [2, 1, 1, 2],
  spiderType: 1,
}
