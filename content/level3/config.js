export const level3Config = {
  gravity: 1400,
  playerSpeed: 400,
  jumpForce: 650,
  nbLives: 5,
  playerStartPosX: 1500,
  playerStartPosY: 100,
  birdRanges: [200, 100, 250, 300, 300, 150, 150, 400, 100, 50, 350, 300],
  birdType: 1,

  //positions of birds
  birdPositions: [
    () => vec2(2200, 200),
    () => vec2(1900, 300),
    () => vec2(3000, 100),
    () => vec2(5000, 80),
    () => vec2(6000, 200),
    () => vec2(6100, 150),
  ],
}
