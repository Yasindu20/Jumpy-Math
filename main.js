import kaboom from "./libs/kaboom.mjs"
import { Player } from "./entities/Player.js"
import { Fish } from "./entities/Fish.js"
import { Flames } from "./entities/Flames.js"
import { Spiders } from "./entities/Spiders.js"
import { Camera } from "./utils/Camera.js"
import { level1Layout, level1Mappings } from "./content/level1/level1Layout.js"
import { level1Config } from "./content/level1/config.js"
import { level2Config } from "./content/level2/config.js"
import { UIManager } from "./utils/UIManager.js"
import { level2Layout, level2Mappings } from "./content/level2/level2Layout.js"
import { Level } from "./utils/Level.js"
import { Axes } from "./entities/Axes.js"
import { Saws } from "./entities/Saws.js"
import { level3Config } from "./content/level3/config.js"
import { level3Layout, level3Mappings } from "./content/level3/level3Layout.js"
import { Birds } from "./entities/Birds.js"
import { load } from "./utils/loader.js"
import { bgSoundManager } from "./utils/BGSoundManager.js"

//setup the screen canvas
kaboom({
  width: 1280,
  height: 720,
  letterbox: true, //for resize the canvas
  debug: false,
})

// Load fonts, assets, and sounds
load.fonts()
load.assets()
load.sounds()

// Define scenes in an object, with each level, menu, and end-game state
const scenes = {
  createAccount: () => {
    UIManager.displayCreateAccountScreen();
  },
  signup: () => {
    console.log('Displaying Sign Up Screen');
    UIManager.displaySignUpScreen();
  },
  login: () => {
    console.log('Displaying Login Screen');
    UIManager.displayLoginScreen();
  },
  menu: () => {
    UIManager.displayMainMenu()
  },
  controls: () => {
    UIManager.displayControlsMenu()
  },
  credits: () => {
    UIManager.displayCreditsMenu()
  },

  // Level 1
  1: () => {
    // Start background ambiance
    bgSoundManager.addSound("water-ambience", {
      volume: 0.02,
      loop: true,
    })
    bgSoundManager.play("water-ambience")
    const level1 = new Level()
    setGravity(level1Config.gravity) //set gravity
    level1.drawBackground("forest-background") //draw background for level 1
    level1.drawMapLayout(level1Layout, level1Mappings) //draw the map for level 1

    //add the player to the level 
    const player = new Player(
      level1Config.playerStartPosX,
      level1Config.playerStartPosY,
      level1Config.playerSpeed,
      level1Config.jumpForce,
      level1Config.nbLives,
      1,
      false
    )
    player.enablePassthrough() //Allow to pass through one-way tiles
    player.enableCoinPickUp() //Enable coin pickup
    player.enableMobVunerability() //player will vunerable to enemy collusion 

    // Initialize fish enemies
    const fish = new Fish(
      level1Config.fishPositions.map((fishPos) => fishPos()),
      level1Config.fishAmplitudes,
      level1Config.fishType
    )
    fish.setMovementPattern() //fish movements

    // Initialize spider
    const spiders = new Spiders(
      level1Config.spiderPositions.map((spiderPos) => spiderPos()),
      level1Config.spiderAmplitudes,
      level1Config.spiderSpeeds,
      level1Config.spiderType
    )
    spiders.setMovementPattern() //spider movements
    spiders.enablePassthrough() //Allow spiders to pass through one-way tiles

    level1.drawWaves("water", "wave") //draw water waves

    const camera = new Camera()
    camera.attach(player.gameObj, 0, -200, null, 200)
    UIManager.addDarkBg() //dark background for live and coin count 
    UIManager.displayLivesCount(player) //Display player's lives count
    UIManager.displayCoinCount(player) //Display player's coin count

    player.updateLives(UIManager.livesCountUI) // Update lives count
    player.updateCoinCount(UIManager.coinCountUI) // Update coin count
    // When the player loses all lives, call the respawnPlayer() method
    if (player.lives === 0) {
      player.respawnPlayer(); // This will handle fetching the API and displaying the question
    }
    onKeyPress("escape", () => {
      UIManager.togglePause();
    });
    onUpdate(() => {
      if (player.gameObj && player.gameObj.paused) {
        get("player").forEach((p) => {
          p.paused = true;
        });
      }
    });
  },
  2: () => {
    bgSoundManager.pauseAllSounds() // Pause previous sounds
    bgSoundManager.addSound("lava-ambience", { loop: true })
    bgSoundManager.play("lava-ambience")
    setGravity(level2Config.gravity)

    const level2 = new Level()
    level2.drawBackground("castle-background")
    level2.drawMapLayout(level2Layout, level2Mappings)

    const player = new Player(
      level2Config.playerStartPosX,
      level2Config.playerStartPosY,
      level2Config.playerSpeed,
      level2Config.jumpForce,
      level2Config.nbLives,
      2,
      false
    )
    player.enablePassthrough()
    player.enableCoinPickUp()
    player.enableMobVunerability()

    // Initialize flame enemies
    const flames = new Flames(
      level2Config.flamePositions.map((flamePos) => flamePos()),
      level2Config.flameAmplitudes,
      level2Config.flameType
    )
    flames.setMovementPattern() //set movement pattern

    const spiders = new Spiders(
      level2Config.spiderPositions.map((spiderPos) => spiderPos()),
      level2Config.spiderAmplitudes,
      level2Config.spiderSpeeds,
      level2Config.spiderType
    )
    spiders.setMovementPattern()
    spiders.enablePassthrough()

    // Initialize swinging axes
    const axes = new Axes(
      level2Config.axesPositions.map((axePos) => axePos()),
      level2Config.axesSwingTimes
    )
    axes.setMovementPattern() //axes movement patterns

    // Initialize saw traps
    const saws = new Saws(
      level2Config.sawPositions.map((sawPos) => sawPos()),
      level2Config.sawRanges
    )
    saws.rotate() //axes rotate movement 

    level2.drawWaves("lava", "wave")

    // Attach camera to player for tracking
    const camera = new Camera()
    camera.attach(player.gameObj, 0, -200, null, 200)

    UIManager.addDarkBg()
    UIManager.displayLivesCount(player)
    UIManager.displayCoinCount(player)

    player.updateLives(UIManager.livesCountUI)
    player.updateCoinCount(UIManager.coinCountUI)

    // When the player loses all lives, call the respawnPlayer() method
    if (player.lives === 0) {
      player.respawnPlayer(); // This will handle fetching the API and displaying the question
    }
    onKeyPress("escape", () => {
      UIManager.togglePause();
    });
    onUpdate(() => {
      if (player.gameObj && player.gameObj.paused) {
        get("player").forEach((p) => {
          p.paused = true;
        });
      }
    });
  },
  3: () => {
    bgSoundManager.pauseAllSounds()
    bgSoundManager.addSound("strong-wind", { volume: 0.2, loop: true })
    bgSoundManager.play("strong-wind")
    setGravity(level3Config.gravity)
    const level3 = new Level()
    level3.drawBackground("sky-background-0")
    level3.drawBackground("sky-background-1")
    level3.drawBackground("sky-background-2")
    level3.drawMapLayout(level3Layout, level3Mappings)

    const player = new Player(
      level3Config.playerStartPosX,
      level3Config.playerStartPosY,
      level3Config.playerSpeed,
      level3Config.jumpForce,
      level3Config.nbLives,
      3,
      true //final level
    )
    player.enablePassthrough()
    player.enableCoinPickUp()
    player.enableMobVunerability()

    level3.drawWaves("clouds", "wave")

    const birds = new Birds(
      level3Config.birdPositions.map((birdPos) => birdPos()),
      level3Config.birdRanges,
      level3Config.birdType
    )

    birds.setMovementPattern()

    const camera = new Camera()
    camera.attach(player.gameObj, 0, -200, null, 200)

    UIManager.addDarkBg()
    UIManager.displayLivesCount(player)
    UIManager.displayCoinCount(player)

    player.updateLives(UIManager.livesCountUI)
    player.updateCoinCount(UIManager.coinCountUI)

    // When the player loses all lives, call the respawnPlayer() method
    if (player.lives === 0) {
      player.respawnPlayer(); // This will handle fetching the API and displaying the question
    }
    onKeyPress("escape", () => {
      UIManager.togglePause();
    });
    onUpdate(() => {
      if (player.gameObj && player.gameObj.paused) {
        get("player").forEach((p) => {
          p.paused = true;
        });
      }
    });
  },
  gameover: async () => UIManager.displayGameOverScreen(),
  end: () => UIManager.displayEndGameScreen(), // End game scene
}

//screen for one scene to another scene
for (const key in scenes) {
  scene(key, scenes[key])
}

//for default starting scene
go("createAccount")
