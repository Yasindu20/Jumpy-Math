export const level2Config = {
  gravity: 1400, //Gravity applied to all entities in the level
  playerSpeed: 400, //Player's horizontal movement speed
  jumpForce: 650, //Player's jump strength
  nbLives: 3, //number of lives
  playerStartPosX: 1500, //Starting X position of the player
  playerStartPosY: 100, //Starting Y position of the player

  //posititon of flames
  flamePositions: [
    () => vec2(2595, 600),
    () => vec2(2655, 600),
    () => vec2(2775, 600),
    () => vec2(2875, 600),
    () => vec2(4220, 550),
    () => vec2(5200, 550),
    () => vec2(5300, 550),
    () => vec2(5700, 550),
    () => vec2(5800, 550),
    () => vec2(5900, 550),
  ],

  //range of vertical movement for each flame
  flameAmplitudes: [300, 500, 400, 300, 500, 900, 800, 500, 500, 900, 800, 500],
  flameType: 1,
  spiderPositions: [
    () => vec2(1900, 0),
    () => vec2(3500, 300),
    () => vec2(4500, 300),
  ],
  spiderAmplitudes: [300, 150, 150, 300, 300],
  spiderSpeeds: [2, 1, 1, 2, 2],
  spiderType: 2,

  //position of axes
  axesPositions: [
    () => vec2(2100, -50),
    () => vec2(7000, 10),
    () => vec2(7300, 10),
  ],
  axesSwingTimes: [1, 2, 3, 2], //swing speed of axes
  sawPositions: [() => vec2(8000, 350), () => vec2(9000, 350)], //saw positions
  sawRanges: [300, 500],
}
