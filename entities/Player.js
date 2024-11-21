// Add this function to fetch the math problem from the API
async function fetchMathProblem() {
  try {
    let response = await fetch('https://marcconrad.com/uob/banana/api.php');
    if (!response.ok) {
      throw new Error('Failed to fetch math problem');
    }
    let data = await response.json();
    return data; // { question: "image_url", solution: "correct_answer" }
  } catch (error) {
    console.error(error);
    return null;
  }
}

import { gameSaveManager } from "../utils/gameSaveManager.js";

export class Player {
  heightDelta = 0 //Tracks the difference in player's height to detect movement
  isMoving = false //track player movement
  isRespawning = false
  lives = 3
  coins = 0
  jumpCount = 0 // Tracks number of jumps performed
  maxJumps = 2 // Maximum jumps allowed
  coyoteLapse = 0.1
  timeSinceLastGrounded = 0 // Tracks the last grounded time

  //player properties
  constructor(
    posX,
    posY,
    speed,
    jumpForce,
    nbLives,
    currentLevelScene,
    isInTerminalScene
  ) {
    this.isInTerminalScene = isInTerminalScene //terminal scene check
    this.currentLevelScene = currentLevelScene //Holds the current level
    this.makePlayer(posX, posY) //player character coordinates
    this.speed = speed //player's speed
    this.jumpForce = jumpForce //player's jump force
    this.lives = nbLives //player's live count
    this.previousHeight = this.gameObj.pos.y // Tracks the previous vertical position of the player
    this.setPlayerControls() //set controls for player
    this.update() //to handle animations and respawn checks
  }

  makePlayer(x, y) {
    this.initialX = x //stores the initial X position for respawn
    this.initialY = y //stores the initial Y position for respawn

    //add player sprite
    this.gameObj = add([
      sprite("player", { anim: "idle" }), //standing animation set first
      area({ shape: new Rect(vec2(0, 3), 8, 8) }), //sets collision area for the player
      anchor("center"), //anchor to center
      pos(x, y), //player position on the map
      scale(4),
      body(), //enable movement and gravity
      "player", //tag for player to identify
    ])
  }

  //Allows player to pass through one-way tile
  enablePassthrough() {
    this.gameObj.onBeforePhysicsResolve((collision) => {
      //avoid collision when player is jumping onto a one-way tile platform
      if (collision.target.is("passthrough") && this.gameObj.isJumping()) {
        collision.preventResolution()
      }
      //If player press down key on a passthrough platform, avoid collision
      if (collision.target.is("passthrough") && isKeyDown("down")) {
        collision.preventResolution()
      }
    })
  }

  //coin collection
  enableCoinPickUp() {
    this.gameObj.onCollide("coin", (coin) => {
      this.coins++ //increase the coin count
      destroy(coin) //Remove coin from game
      play("coin") //Play coin collecting sound
    })
  }

  //Sets up player controls for movement and jumping
  setPlayerControls() {
    //player move left with run animation
    onKeyDown("left", () => {
      if (this.gameObj.paused) return
      if (this.gameObj.curAnim() !== "run") this.gameObj.play("run")
      this.gameObj.flipX = true //Flip sprite image for left 
      if (!this.isRespawning) this.gameObj.move(-this.speed, 0) //Move left
      this.isMoving = true
    })

    //player Moves right 
    onKeyDown("right", () => {
      if (this.gameObj.paused) return
      if (this.gameObj.curAnim() !== "run") this.gameObj.play("run")
      this.gameObj.flipX = false //no flip for right run
      if (!this.isRespawning) this.gameObj.move(this.speed, 0) //Move right
      this.isMoving = true
    })

    //jump control
    onKeyPress("space", () => {
      if (this.gameObj.paused) return
      // Allow jump if within jump count limit
      if (this.jumpCount < this.maxJumps) {
        this.gameObj.jump(this.jumpForce);
        play("jump");
        this.jumpCount++; // Increment jump count on each jump
      }

      //coyote time
      if (
        !this.gameObj.isGrounded() &&
        time() - this.timeSinceLastGrounded < this.coyoteLapse &&
        !this.hasJumpedOnce
      ) {
        this.hasJumpedOnce = true
        this.gameObj.jump(this.jumpForce)
        play("jump")
        this.canDoubleJump = true // Allow double jump even in coyote time
      }
    })

    //Returns player to idle animation if left or right keys aren't pressing
    onKeyRelease(() => {
      if (this.gameObj.paused) return
      if (isKeyReleased("right") || isKeyReleased("left")) {
        this.gameObj.play("idle")
        this.isMoving = false
      }
    })
  }

  // Respawns the player when a life a lost
  // Respawns the player when a life is lost
  respawnPlayer() {
    this.gameObj.pos = vec2(this.initialX, this.initialY); // Reset position to initial coordinates

    if (this.lives > 0) {
      this.lives--; // Decrease lives if any are left
      this.isRespawning = true;
      setTimeout(() => (this.isRespawning = false), 1000); // Disable respawning after 1 second
    } else {
      // No lives left; handle revive mechanism
      this.isRespawning = true;
      setTimeout(() => {
        this.isRespawning = false;
        this.handleRevive(); // Fetch math question after respawning
      }, 1000);
    }
  }

  // Handle the revive mechanism by displaying a math question
  async handleRevive() {
    const problem = await fetchMathProblem();
    if (problem) {
      this.gameObj.paused = true; // Pause the game
      this.askQuestion(problem);
    } else {
      go("gameover"); // If API fails, go to game over
    }
  }

  // Function to display the question and check the player's answer
  askQuestion(problem) {
    // Create a full-screen overlay
    const overlay = document.createElement("div");
    overlay.id = "math-modal";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "1000";

    // Display the math problem image
    const img = document.createElement("img");
    img.src = problem.question;
    img.style.maxWidth = "80%";
    img.style.border = "5px solid #ffcc00";
    img.style.borderRadius = "15px";
    img.style.marginBottom = "20px";
    img.style.boxShadow = "0 0 20px #ffcc00";
    overlay.appendChild(img);

    // Countdown timer display
    const countdown = document.createElement("div");
    countdown.id = "countdown";
    countdown.style.color = "#ff5555";
    countdown.style.fontSize = "24px";
    countdown.style.marginBottom = "20px";
    countdown.style.fontFamily = "'Press Start 2P', cursive";
    overlay.appendChild(countdown);

    // Timer logic
    let timeLeft = 25; // 25 seconds to answer
    const timerInterval = setInterval(() => {
      timeLeft--;
      countdown.textContent = `Time left: ${timeLeft}s`;

      // If time runs out, clear the overlay and go to game over
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        document.body.removeChild(overlay);
        go("gameover");
      }
    }, 1000);

    // Input field for the answer
    const input = document.createElement("input");
    input.id = "input";
    input.type = "text";
    input.placeholder = "Enter your answer...";
    input.style.padding = "12px";
    input.style.marginBottom = "20px";
    input.style.width = "300px";
    input.style.textAlign = "center";
    input.style.border = "3px solid #00ff00";
    input.style.borderRadius = "10px";
    input.style.backgroundColor = "#222";
    input.style.color = "#00ff00";
    input.style.fontSize = "18px";
    input.style.fontFamily = "'Press Start 2P', cursive";
    overlay.appendChild(input);

    // Button to submit the answer
    const submitButton = document.createElement("button");
    submitButton.textContent = "Submit Answer";
    submitButton.style.padding = "15px 30px";
    submitButton.style.marginBottom = "10px";
    submitButton.style.backgroundColor = "#00ccff";
    submitButton.style.border = "none";
    submitButton.style.color = "#222";
    submitButton.style.borderRadius = "8px";
    submitButton.style.fontSize = "18px";
    submitButton.style.cursor = "pointer";
    submitButton.style.fontFamily = "'Press Start 2P', cursive";
    submitButton.style.transition = "background-color 0.3s, transform 0.2s";

    // Hover effect for submit button
    submitButton.onmouseover = () => (submitButton.style.backgroundColor = "#0077cc");
    submitButton.onmouseout = () => (submitButton.style.backgroundColor = "#00ccff");
    submitButton.onclick = () => {
      clearInterval(timerInterval); // Stop the timer
      this.checkAnswer(problem.solution, overlay);
    };
    overlay.appendChild(submitButton);

    // "I Give Up" button
    const giveUpButton = document.createElement("button");
    giveUpButton.textContent = "I Give Up";
    giveUpButton.style.padding = "15px 30px";
    giveUpButton.style.marginTop = "10px";
    giveUpButton.style.backgroundColor = "#ff5555";
    giveUpButton.style.border = "none";
    giveUpButton.style.color = "#222";
    giveUpButton.style.borderRadius = "8px";
    giveUpButton.style.fontSize = "18px";
    giveUpButton.style.cursor = "pointer";
    giveUpButton.style.fontFamily = "'Press Start 2P', cursive";
    giveUpButton.style.transition = "background-color 0.3s, transform 0.2s";

    // Hover effect for give up button
    giveUpButton.onmouseover = () => (giveUpButton.style.backgroundColor = "#cc0000");
    giveUpButton.onmouseout = () => (giveUpButton.style.backgroundColor = "#ff5555");
    giveUpButton.onclick = () => {
      clearInterval(timerInterval);
      document.body.removeChild(overlay);
      go("gameover");
    };
    overlay.appendChild(giveUpButton);

    // Message display
    const note = document.createElement("div");
    note.id = "note";
    note.style.color = "#ffffff";
    note.style.marginTop = "20px";
    note.style.fontFamily = "'Press Start 2P', cursive";
    overlay.appendChild(note);

    // Add the overlay to the document body
    document.body.appendChild(overlay);
  }

  // Function to check the player's answer
  checkAnswer(solution, overlay) {
    const input = document.getElementById("input");
    const note = document.getElementById("note");

    // Ensure both values are treated as strings and trim spaces from input
    const userAnswer = input.value.trim();
    const correctAnswer = solution.toString().trim();

    console.log("User Answer:", userAnswer);
    console.log("Correct Answer:", correctAnswer);

    if (userAnswer === correctAnswer) {
      // Correct answer
      note.textContent = "Correct! You've revived!";
      setTimeout(() => {
        this.lives = 1; // Grant an extra life
        this.continueAtSameLevel();
        document.body.removeChild(overlay); // Remove the modal
        this.gameObj.paused = false; // Resume the game
        this.isReviving = false; // Reset reviving flag
      }, 1000);
    } else {
      // Incorrect answer
      note.textContent = "Incorrect! Try again!";
      input.value = ""; // Clear the input field for another attempt
      setTimeout(() => {
        // Generate a new question after 1 second if the answer is wrong
        this.handleRevive();
        document.body.removeChild(overlay);
      }, 1000);
    }
  }

  // Function to continue the game at the same level
  continueAtSameLevel() {
    go(this.currentLevelScene); // Go back to the same level
  }

  //Enables vulnerability to enemy 
  enableMobVunerability() {
    function hitAndRespawn(context) {
      play("hit", { speed: 1.5 }) //Play hit sound
      context.respawnPlayer() // Call respawn when hit on enemy
    }
    this.gameObj.onCollide("fish", () => hitAndRespawn(this))
    this.gameObj.onCollide("spiders", () => hitAndRespawn(this))
    this.gameObj.onCollide("flames", () => hitAndRespawn(this))
    this.gameObj.onCollide("axes", () => hitAndRespawn(this))
    this.gameObj.onCollide("saws", () => hitAndRespawn(this))
    this.gameObj.onCollide("birds", () => hitAndRespawn(this))
  }

  //handles animations and falls off screen
  update() {
    onUpdate(() => {
      //When player grounded jump state is reset, allowing for another jump
      if (this.gameObj.isGrounded()) {
        this.jumpCount = 0 // Reset jump count on landing
        this.timeSinceLastGrounded = time()
      }

      //Calculate height change for jump detection
      this.heightDelta = this.previousHeight - this.gameObj.pos.y
      this.previousHeight = this.gameObj.pos.y

      //Play standing if player is not moving
      if (!this.isMoving && this.gameObj.curAnim() !== "idle") {
        this.gameObj.play("idle")
      }

      //Play jump-up animation
      if (
        !this.gameObj.isGrounded() &&
        this.heightDelta > 0 &&
        this.gameObj.curAnim() !== "jump-up"
      ) {
        this.gameObj.play("jump-up")
      }

      //Play jump-up animation
      if (
        !this.gameObj.isGrounded() &&
        this.heightDelta < 0 &&
        this.gameObj.curAnim() !== "jump-down"
      ) {
        this.gameObj.play("jump-down")
      }

      //Respawn player if they fall out of bounds
      if (this.gameObj.pos.y > 1000 && !this.isRespawning) {
        play("hit", { speed: 1.5 });
        this.respawnPlayer();
      }
    })
  }

  //Update the player's lives on the UI
  updateLives(livesCountUI) {
    onUpdate(() => {
      livesCountUI.text = `${this.lives}` //Update lives display
    })
  }

  async fetchDadJoke() {
    try {
      const response = await fetch('https://icanhazdadjoke.com/', {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dad joke');
      }

      const data = await response.json();
      return data.joke;
    } catch (error) {
      console.error('Error fetching dad joke:', error);
      return 'Why did the programmer quit his job? Because he didn\'t get arrays! (Backup joke)';
    }
  }

  displayDadJoke(joke, nextLevel) {

    // Pause the game
    this.gameObj.paused = true;
    get("player").forEach((p) => {
      p.paused = true;
    });

    // Create full-screen overlay similar to math problem modal
    const overlay = document.createElement("div");
    overlay.id = "dad-joke-modal";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "1000";
    overlay.style.fontFamily = "'Press Start 2P', cursive";
    overlay.style.color = "#00ff00";
    overlay.style.padding = "20px";
    overlay.style.textAlign = "center";

    // Dad Joke Title
    const title = document.createElement("h1");
    title.textContent = "Dad Joke Unlocked!";
    title.style.marginBottom = "30px";
    title.style.fontSize = "24px";
    overlay.appendChild(title);

    // Joke Text
    const jokeText = document.createElement("p");
    jokeText.textContent = joke;
    jokeText.style.fontSize = "18px";
    jokeText.style.maxWidth = "80%";
    jokeText.style.lineHeight = "1.5";
    overlay.appendChild(jokeText);

    // Continue Button
    const continueButton = document.createElement("button");
    continueButton.textContent = "Continue";
    continueButton.style.padding = "15px 30px";
    continueButton.style.marginTop = "30px";
    continueButton.style.backgroundColor = "#00ccff";
    continueButton.style.border = "none";
    continueButton.style.color = "#222";
    continueButton.style.borderRadius = "8px";
    continueButton.style.fontSize = "18px";
    continueButton.style.cursor = "pointer";
    continueButton.style.fontFamily = "'Press Start 2P', cursive";
    continueButton.style.transition = "background-color 0.3s, transform 0.2s";

    // Hover effects for continue button
    continueButton.onmouseover = () => {
      continueButton.style.backgroundColor = "#0077cc";
      continueButton.style.transform = "scale(1.05)";
    };
    continueButton.onmouseout = () => {
      continueButton.style.backgroundColor = "#00ccff";
      continueButton.style.transform = "scale(1)";
    };

    continueButton.onclick = () => {

      // Unpause the game
      this.gameObj.paused = false;
      get("player").forEach((p) => {
        p.paused = false;
      });

      document.body.removeChild(overlay);
    };

    overlay.appendChild(continueButton);

    // Add the overlay to the document body
    document.body.appendChild(overlay);
  }

  //Update the player's coin count and check level completion
  updateCoinCount(coinCountUI) {
    onUpdate(async () => {
      coinCountUI.text = `${this.coins} / ${coinCountUI.fullCoinCount}`
      // If all coins are collected, save progress and go to next level
      if (this.coins === coinCountUI.fullCoinCount) {
        const nextLevel = this.isInTerminalScene ? "end" : this.currentLevelScene + 1;

        // Save progress before moving to next level
        if (!this.isInTerminalScene) {
          gameSaveManager.saveGameState(this.currentLevelScene + 1);
        }

        // Go to next level first
        go(nextLevel);

        // Fetch dad joke and display after level transition
        const dadJoke = await this.fetchDadJoke();
        this.displayDadJoke(dadJoke, nextLevel);
      }
    })
  }
}
