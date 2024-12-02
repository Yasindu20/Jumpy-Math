import kaboom from "../../libs/kaboom.mjs";
import { bgSoundManager } from "./BGSoundManager.js"
import { registerUser } from "./auth.js";
import { loginUser, getUserData } from "./auth.js";
import { gameSaveManager } from "./gameSaveManager.js";
import { leaderboardManager } from "./LeaderboardManager.js";
import { getUsername } from "./auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";
import { auth, db } from "./firebase.js";

class UI {
  constructor() {
    this.username = ""; // Store username
    this.password = ""; // Store password
    this.showPassword = false; // Password visibility state
    this.uiElements = []; // Array to store all created UI elements
    this.isPaused = false; // Track pause state
  }

  displayPauseMenu() {
    if (!this.isPaused) return;

    // Add semi-transparent dark overlay
    const overlay = add([
      rect(width(), height()),
      color(0, 0, 0),
      opacity(0.7),
      fixed(),
      z(100),
      "pauseOverlay"
    ]);

    // Add pause menu title
    const pauseTitle = add([
      text("PAUSED", {
        font: "Round",
        size: 64,
        color: rgb(255, 255, 255)
      }),
      pos(center().x, center().y - 150),
      anchor("center"),
      fixed(),
      z(101),
      "pauseMenu"
    ]);

    // Add pause menu buttons
    this.addPauseButton("Resume", { x: center().x, y: center().y }, () => {
      this.resumeGame();
    });

    this.addPauseButton("Save Game", { x: center().x, y: center().y + 80 }, async () => {
      if (gameSaveManager.isLoggedIn()) {
        await gameSaveManager.saveGameState();
        alert("Game saved successfully!");
      } else {
        alert("Please log in to save your game.");
      }
    });

    this.addPauseButton("Main Menu", { x: center().x, y: center().y + 160 }, () => {
      if (confirm("Are you sure you want to return to the main menu?")) {
        this.resumeGame();
        bgSoundManager.pauseAllSounds(); // Add this line to stop all background sounds
        go("menu");
      }
    });

    // Store pause menu elements for cleanup
    this.uiElements.push(overlay);
    this.uiElements.push(pauseTitle);
  }

  addPauseButton(label, position, onClick) {
    const button = add([
      text(label, {
        size: 32,
        font: "Round",
        color: rgb(255, 255, 255)
      }),
      pos(position.x, position.y),
      area(),
      anchor("center"),
      fixed(),
      z(101),
      scale(1),
      "pauseMenu",
      {
        isHovered: false,
        clickAction: onClick,
      },
    ]);

    button.onUpdate(() => {
      if (button.isHovered) {
        button.color = rgb(255, 215, 0);
        button.scaleTo(1.2);
      } else {
        button.color = rgb(255, 255, 255);
        button.scaleTo(1);
      }
    });

    button.onHover(() => {
      button.isHovered = true;
    });

    button.onClick(() => {
      play("confirm-ui", { speed: 1.5 });
      button.clickAction();
    });

    button.onHoverEnd(() => {
      button.isHovered = false;
    });

    this.uiElements.push(button);
  }

  pauseGame() {
    if (!this.isPaused) {
      this.isPaused = true;
      // Pause all game objects that can be paused
      get("*").forEach((obj) => {
        if (obj.paused !== undefined) {
          obj.paused = true;
        }
      });
      this.displayPauseMenu();
    }
  }

  resumeGame() {
    if (this.isPaused) {
      this.isPaused = false;
      // Resume all game objects that can be paused
      get("*").forEach((obj) => {
        if (obj.paused !== undefined) {
          obj.paused = false;
        }
      });
      destroyAll("pauseOverlay");
      destroyAll("pauseMenu");
    }
  }

  togglePause() {
    if (this.isPaused) {
      this.resumeGame();
    } else {
      this.pauseGame();
    }
  }

  // Create a text input field
  createTextInput(position, label, type = "text") {
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "50%";
    container.style.top = `${position.y}px`;
    container.style.transform = "translate(-50%, -50%)"; // Center the container
    container.style.textAlign = "left"; // Align text within the container

    // Create a label for the input field
    const labelElement = document.createElement("label");
    labelElement.textContent = label;
    labelElement.style.color = "#FFF";
    labelElement.style.fontSize = "24px";
    labelElement.style.marginBottom = "10px";
    labelElement.style.display = "block"; // Make sure the label is above the input

    // Create the input field
    const input = document.createElement("input");
    input.type = type;
    input.placeholder = label;
    input.className = "game-input";
    input.style.width = "400px"; // Make the input field longer
    input.style.padding = "12px";
    input.style.fontSize = "18px";
    input.style.borderRadius = "8px";
    input.style.border = "2px solid #888";
    input.style.backgroundColor = "#222";
    input.style.color = "#FFF";
    input.style.outline = "none";
    input.style.marginTop = "8px";

    // Append label and input field to the container
    container.appendChild(labelElement);
    container.appendChild(input);
    document.body.appendChild(container);

    // Store elements for cleanup later
    this.uiElements.push(container);

    return input;
  }

  // Create a checkbox for toggling password visibility
  createCheckbox(labelText, position, onChange) {
    const checkboxContainer = document.createElement("div");
    checkboxContainer.style.position = "absolute";
    checkboxContainer.style.left = "50%";
    checkboxContainer.style.top = `${position.y}px`;
    checkboxContainer.style.transform = "translate(-50%, -50%)"; // Center container
    checkboxContainer.style.textAlign = "center";
    checkboxContainer.style.color = "#FFF";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "showPassword";
    checkbox.style.marginRight = "10px";

    const label = document.createElement("label");
    label.textContent = labelText;
    label.htmlFor = "showPassword";
    label.style.fontSize = "18px";

    checkbox.addEventListener("change", () => onChange(checkbox.checked));

    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(label);
    document.body.appendChild(checkboxContainer);

    // Store elements for cleanup later
    this.uiElements.push(checkboxContainer)
  }

  // Function to remove all text inputs, checkboxes, and other elements
  cleanupElements() {
    this.uiElements.forEach((el) => {
      if (el.destroy) {
        el.destroy(); // For Kaboom.js elements
      } else if (el.remove) {
        el.remove(); // For DOM elements
      }
    });
    this.uiElements = []; // Clear the array
  }

  //Displays the player's current lives
  displayLivesCount(player) {
    //UI element with the player's remaining lives
    this.livesCountUI = add([
      text(`${player.lives}`, {
        font: "Round", // Font style
        size: 50, // Font size
      }),
      fixed(), //Makes the UI element stay in a fixed position
      pos(70, 10), //Position of the lives count
    ])

    //Adds a "star" icon next to the lives count
    this.livesCountUI.add([
      sprite("star-icon"),
      pos(-60, -5),
      scale(3),
      fixed(),
    ])
  }

  //Displays the player's coin count and total coins in the level
  displayCoinCount(player) {
    this.coinCountUI = add([
      text(`${player.coins} / ${this.fullCoinCount}`, {
        font: "Round",
        size: 50,
      }),
      {
        fullCoinCount: get("coin", { recursive: true }).length, //Sets the full coin count by retrieving all coins
      },
      fixed(),
      pos(70, 70),
    ])

    // Adds a coin icon
    this.coinCountUI.add([sprite("coin-icon"), pos(-60, 0), scale(3), fixed()])
  }

  // Displays a blinking UI message
  displayBlinkingUIMessage(content, position) {
    const message = add([
      text(content, {
        size: 24,
        font: "Round"
      }),
      area(), //to use anchor
      anchor("center"),
      pos(position),
      opacity(), //set the blinking effect
      state("flash-up", ["flash-up", "flash-down"]), //state of blinking effect, starting with flash-up
    ])

    // When message's flash-up state, this function is working
    message.onStateEnter("flash-up", async () => {
      // Start an asynchronous tween animation
      //wait to start tween
      await tween(
        message.opacity, // Start value
        0,  // end value - fade out to 0
        0.5,  //Duration of the fade out animation
        (opacity) => (message.opacity = opacity), //adjusts the opacity
        easings.linear //linear easing for smooth transition without acceleration
      )
      message.enterState("flash-down") //transitions to the flash-down state
    })

    // When the message enters the "flash-down" state, this function is triggered
    message.onStateEnter("flash-down", async () => {
      await tween(
        message.opacity,
        1, //Fade-in back to fully visible
        0.5,
        (opacity) => (message.opacity = opacity),
        easings.linear
      )
      message.enterState("flash-up") //Moves back to the flash-up state
    })
  }

  displayCreateAccountScreen() {
    add([sprite("main-background"), scale(1.25)]);

    add([
      text("Welcome to Jumpy Maths", { font: "Round", size: 50, color: rgb(255, 215, 0) }),
      anchor("center"),
      pos(center().x, center().y - 200),
    ]);

    this.addButton("Sign Up", { x: center().x, y: 300 }, () => {
      play("confirm-ui");
      go("signup");
    });

    this.addButton("Login", { x: center().x, y: 400 }, () => {
      play("confirm-ui");
      go("login");
    });
  }


  displaySignUpScreen() {
    this.cleanupElements();
    add([sprite("main-background"), scale(1.25)]);

    add([
      text("Create Account", { font: "Round", size: 50, color: rgb(0, 200, 255) }),
      anchor("center"),
      pos(center().x, center().y - 300),
    ]);

    const usernameInput = this.createTextInput({ x: center().x - 100, y: 200 }, "Email");
    const passwordInput = this.createTextInput({ x: center().x - 100, y: 300 }, "Password", "password");

    this.createCheckbox("Show Password", { x: center().x, y: 360 }, (isChecked) => {
      passwordInput.type = isChecked ? "text" : "password";
    });

    this.addButton("Sign Up", { x: center().x, y: 450 }, async () => {
      const username = usernameInput.value;
      const password = passwordInput.value;
      const user = await registerUser(username, password);

      if (user) {
        await setDoc(doc(db, "users", user.uid), {
          email: username,
          currentLevel: 1
        }, { merge: true });

        alert(`Account created for ${username}!`);
        go("menu");
        play("confirm-ui");
        this.cleanupElements();
      } else {
        alert("Error creating account. Please try again.");
      }
    });

    this.addButton("Already have an account? Login", { x: center().x, y: 550 }, () => {
      go("login");
      play("confirm-ui");
      this.cleanupElements();
    });

    this.addButton("Back", { x: center().x, y: 650 }, () => {
      play("confirm-ui");
      go("createAccount");
      this.cleanupElements();
    });
  }

  displayLoginScreen() {
    this.cleanupElements(); // Clean up previous UI elements
    add([sprite("main-background"), scale(1.25)]);

    add([
      text("Log and Countinue the Game", { font: "Round", size: 50, color: rgb(0, 255, 150) }),
      anchor("center"),
      pos(center().x, center().y - 300),
    ]);

    const usernameInput = this.createTextInput({ x: center().x - 100, y: 200 }, "Email");
    const passwordInput = this.createTextInput({ x: center().x - 100, y: 300 }, "Password", "password");

    this.createCheckbox("Show Password", { x: center().x, y: 360 }, (isChecked) => {
      passwordInput.type = isChecked ? "text" : "password";
    });

    this.addButton("Login", { x: center().x, y: 400 }, async () => {
      const username = usernameInput.value;
      const password = passwordInput.value;
      const user = await loginUser(username, password);

      if (user) {
        await setDoc(doc(db, "users", user.uid), {
          email: username
        }, { merge: true });

        const data = await getUserData(user.uid);
        if (data) {
          alert(`Welcome back, ${username}!`);
          play("confirm-ui");
          go("menu");
          this.cleanupElements();
        }
      } else {
        alert("Invalid login credentials.");
      }
    });

    this.addButton("Back", { x: center().x, y: 500 }, () => {
      play("confirm-ui");
      go("createAccount");
      this.cleanupElements();
    });
  }


  displayMainMenu() {
    add([sprite("main-background"), scale(1.25)]);
    //add the logo the main manu
    add([
      sprite("logo"),
      fixed(), //stays in a fixed position, doesn't move with the camera
      area(), //allows to use anchor compornant and detect clicks or overlaps
      anchor("center"),
      pos(center().x, center().y - 250), //positioning to the center
      scale(1.75), //2 times its original size
    ])

    if (gameSaveManager.isLoggedIn()) {
      (async () => {
        const uid = auth.currentUser?.uid;
        if (uid) {
          const username = await getUsername(uid);
          if (username) {
            // Extract username without email domain
            const playerName = username.split('@')[0];

            // Animated welcome container
            const welcomeContainer = add([
              rect(400, 100),
              color(0, 100, 0),  // Dark green background
              opacity(0.7),
              pos(20, 20),
              fixed(),
              z(10),
              outline(4, rgb(0, 255, 0)),  // Bright green outline
              "welcomeMessage",  // Add a tag to identify this element
              {
                update() {
                  // Subtle pulsing effect
                  const pulse = Math.sin(time() * 3) * 0.1 + 1;
                  this.scale = vec2(pulse, pulse);
                }
              }
            ]);

            // Player icon or avatar placeholder
            welcomeContainer.add([
              sprite("star-icon"),  // You can replace with a player avatar sprite
              pos(10, 10),
              scale(2)
            ]);

            // Welcome text with dynamic effects
            const welcomeText = welcomeContainer.add([
              text(`ADVENTURE AWAITS, \n${playerName.toUpperCase()}!`, {
                font: "Round",
                size: 24,
                color: rgb(0, 255, 0)  // Bright green text
              }),
              pos(100, 20),
              {
                update() {
                  // Text color pulsing effect
                  const t = time() * 5;
                  const greenIntensity = Math.sin(t) * 0.5 + 0.5;
                  this.color = rgb(
                    0,                    // Red (kept at 0)
                    255 * greenIntensity, // Green component
                    0                     // Blue (kept at 0)
                  );

                  // Subtle text scaling
                  const pulse = Math.sin(t) * 0.1 + 1;
                  this.scale = vec2(pulse, pulse);
                }
              }
            ]);

            // Add a particle effect for extra flair
            const particleLoop = loop(0.1, () => {
              add([
                rect(5, 5),
                pos(rand(20, 420), 20),
                color(0, 255, 0),
                opacity(rand(0.3, 0.8)),
                lifespan(1),
                move(DOWN, rand(50, 200)),
                "welcomeParticle"
              ]);
            });

            // Store the particle loop for potential cleanup
            this.uiElements.push(particleLoop);
          }
        }
      })();
    }

    // Regular menu buttons
    this.addButton("New Game", { x: center().x, y: 250 }, () => {
      play("confirm-ui");
      go("controls");
    });

    if (gameSaveManager.isLoggedIn()) {
      this.addButton("Load Game", { x: center().x, y: 350 }, async () => {
        const savedState = await gameSaveManager.loadGameState();
        if (savedState && savedState.currentLevel) {
          go(savedState.currentLevel);
        } else {
          alert("No saved game found. Starting new game...");
          play("confirm-ui");
          go("controls");
        }
      });
    }

    this.addButton("Leaderboard", { x: center().x, y: 450 }, () => {
      play("confirm-ui");
      this.displayLeaderboard();
    });

    this.addButton("Credits", { x: center().x, y: 550 }, () => {
      play("confirm-ui");
      this.displayCreditsMenu();
    });

    this.addButton("Quit Game", { x: center().x, y: 650 }, () => {
      play("confirm-ui");
      go("createAccount");
    });
  }

  displayLeaderboard() {
    destroyAll("welcomeMessage");
    destroyAll("welcomeParticle");
    this.cleanupElements();
    add([sprite("main-background"), scale(1.25)]);

    add([
      text("GLOBAL LEADERBOARD", {
        font: "Round",
        size: 60,
        color: rgb(255, 0, 0)  // Start with red
      }),
      anchor("center"),
      pos(center().x, center().y - 300),
      {
        update() {
          // Create a pulsing effect that transitions between red and blue
          const t = time() * 3;
          const redIntensity = Math.sin(t) * 0.5 + 0.5;
          const blueIntensity = Math.cos(t) * 0.5 + 0.5;

          this.color = rgb(
            255 * redIntensity,   // Red component
            0,                    // Green component (kept at 0)
            255 * blueIntensity   // Blue component
          );

          // Add a subtle scaling effect
          const pulse = Math.sin(t) * 0.1 + 1;
          this.scale = vec2(pulse, pulse);
        }
      }
    ]);

    // Initialize leaderboard listening
    leaderboardManager.initializeLeaderboard();

    // Create leaderboard container
    const leaderboardContainer = add([
      rect(600, 400),
      color(10, 10, 30),
      opacity(0.9),
      outline(4, rgb(0, 255, 150)),
      anchor("center"),
      pos(center()),
      "leaderboardContainer"
    ]);

    // Decorative border effects
    for (let i = 0; i < 10; i++) {
      add([
        rect(820, 520),
        color(0, 255, 150),
        opacity(0.1 * (10 - i)),
        anchor("center"),
        pos(center().x, center().y),
        z(-1)
      ]);
    }

    // Header row
    const headerRow = add([
      text("RANK | PLAYER | HIGHEST LEVEL", {
        font: "Round",
        size: 24,
        color: rgb(0, 255, 150)
      }),
      pos(center().x, center().y - 220),
      anchor("center"),
      "leaderboardHeader"
    ]);

    // Update leaderboard display
    let lastUpdate = 0;
    leaderboardContainer.onUpdate(() => {
      const now = time();
      if (now - lastUpdate > 1) { // Update every second
        lastUpdate = now;
        this.updateLeaderboardDisplay(leaderboardContainer);
      }
    });

    this.addButton("Back", { x: center().x, y: 620 }, () => {
      play("confirm-ui");
      go("menu");
      this.cleanupElements();
    });
  }

  updateLeaderboardDisplay(container) {
    // Clear existing entries
    destroyAll("leaderboardEntry");

    const leaderboardData = leaderboardManager.getLeaderboardData();
    leaderboardData.forEach((entry, index) => {
      const yPos = center().y - 150 + (index * 40);

      // Rank number
      add([
        text(`${index + 1}.`, {
          font: "Round",
          size: 24,
          color: rgb(255, 255, 255)
        }),
        pos(center().x - 250, yPos),
        anchor("left"),
        "leaderboardEntry"
      ]);

      // Player name
      add([
        text(entry.username.split('@')[0], {
          font: "Round",
          size: 24,
          color: rgb(255, 255, 255)
        }),
        pos(center().x - 150, yPos),
        anchor("left"),
        "leaderboardEntry"
      ]);

      // Level completed
      add([
        text(`Level ${entry.levelCompleted}`, {
          font: "Round",
          size: 24,
          color: rgb(255, 215, 0)
        }),
        pos(center().x + 150, yPos),
        anchor("left"),
        "leaderboardEntry"
      ]);
    });
  }

  displayCreditsMenu() {
    destroyAll("welcomeMessage");
    destroyAll("welcomeParticle");
    this.cleanupElements();

    // Use a solid background instead of complex animations
    add([
      rect(width(), height()),
      color(0, 0, 10),  // Deep space blue-black
    ]);

    // Starry background animation
    function createStars() {
      loop(0.1, () => {
        add([
          rect(2, 2),
          pos(rand(0, width()), 0),
          color(255, 255, 255),
          opacity(rand(0.1, 0.8)),
          move(DOWN, rand(50, 200)),
          lifespan(3),
          "star"
        ]);
      });
    }
    createStars();

    // Credits Title
    add([
      text("CREDITS", {
        font: "Round",
        size: 80,
        color: rgb(0, 255, 150)
      }),
      pos(center().x, 100),
      anchor("center"),
      scale(1),
      {
        update() {
          // Subtle pulsing effect
          const pulse = Math.sin(time() * 3) * 0.1 + 1;
          this.scale = vec2(pulse, pulse);
        }
      }
    ]);

    // Credits Text
    const creditsText = [
      "",
      "JUMPY MATHS",
      "An Educational Platformer Adventure",
      "",
      "Developer",
      "Yasindu Dasanga De Mel",
      "",
      "Inspired By",
      "Classic Platformers like Super Mario Bros.",
      "",
      "Special Thanks",
      "Ms. Nideshika Ellepola",
      "For inspiring this Game Project",
      "",
      "Dulminie",
      "For invaluable Help and support and the Game Idea",
      "",
      "Lochana",
      "For playtesting",
      "",
      "Tools and Resources",
      "Built using Kaboom.js and Firebase",
      "Fonts by FontSpace",
      "Sounds by MixKit",
      "Sprite Images by CraftPix",
      "",
      "Contributions",
      "YouTube Tutorial: 'JavaScript Platformer Game Tutorial'",
      "by JSLegendDev",
      "",
      "AI Support",
      "ChatGPT and Claude.ai",
      "",
      "THANK YOU FOR PLAYING JUMPY MATHS!"
    ];

    // Create a scrolling credits container
    const creditsContainer = add([
      pos(center().x, height()),
      {
        update() {
          this.pos.y -= 50 * dt(); // Scroll speed

          // Reset position when credits scroll off screen
          if (this.pos.y < -creditsText.length * 50) {
            this.pos.y = height();
          }
        }
      }
    ]);

    // Add credits text
    creditsText.forEach((line, index) => {
      const textColor = line.includes("JUMPY MATHS") ? rgb(0, 255, 150)
        : line.includes("Developer") || line.includes("Inspired By") ||
          line.includes("Special Thanks") || line.includes("Tools") ? rgb(255, 215, 0)
          : rgb(255, 255, 255);

      const fontSize = line.includes("JUMPY MATHS") ? 48
        : line.includes("Developer") || line.includes("Inspired By") ||
          line.includes("Special Thanks") || line.includes("Tools") ? 32
          : 24;

      creditsContainer.add([
        text(line, {
          font: "Round",
          size: fontSize,
          color: textColor
        }),
        pos(0, index * 50),
        anchor("center")
      ]);
    });

    // Back Button
    this.addButton("Back", { x: width() - 1200, y: height() - 50 }, () => {
      play("confirm-ui");
      go("menu");
    });
  }


  // Adds a button with hover and click effects
  addButton(label, position, onClick) {
    const button = add([
      text(label, { size: 32, font: "Round", color: rgb(255, 50, 50) }),
      pos(position.x, position.y),
      area(), // Ensure the button has an area component
      anchor("center"),
      outline(4, rgb(0, 0, 0)),
      scale(1.5),
      "ui",
      {
        isHovered: false,
        clickAction: onClick,
      },
    ]);

    // Handle hover effect
    button.onUpdate(() => {
      if (button.isHovered) {
        button.color = rgb(0, 255, 0);
        button.scaleTo(1.8);
      } else {
        button.color = rgb(255, 50, 50);
        button.scaleTo(1.5);
      }
    });

    // Detect hover state
    button.onHover(() => {
      button.isHovered = true;
    });

    // Detect when mouse leaves the button area
    button.onClick(() => {
      button.clickAction();
    });

    button.onHoverEnd(() => {
      button.isHovered = false;
    });
  }

  // Handles UI button clicks
  handleButtonClicks() {
    onClick(() => {
      get("ui").forEach((btn) => {
        if (btn.isHovering() && mouseClick()) {
          btn.clickAction();
        }
      });
    });
  }

  // Displays the controls menu
  displayControlsMenu() {
    add([sprite("forest-background"), scale(4)])
    add([
      text("Controls", { font: "Round", size: 50 }),
      area(),
      anchor("center"),
      pos(center().x, center().y - 200),
    ])

    // Adds icons and labels for movement controls
    const controlPrompts = add([pos(center().x + 30, center().y)])
    controlPrompts.add([sprite("up"), pos(0, -80)])
    controlPrompts.add([sprite("down")])
    controlPrompts.add([sprite("left"), pos(-80, 0)])
    controlPrompts.add([sprite("right"), pos(80, 0)])
    controlPrompts.add([sprite("space"), pos(-200, 0)])
    controlPrompts.add([
      text("Jump", { font: "Round", size: 32 }),
      pos(-190, 100),
    ])
    controlPrompts.add([
      text("Move", { font: "Round", size: 32 }),
      pos(10, 100),
    ])

    // Adds a blinking message for starting the game
    this.displayBlinkingUIMessage(
      "Press [ Enter ] to Start Game",
      vec2(center().x, center().y + 300)
    )

    // Transitions to the game level on pressing Enter
    onKeyPress("enter", () => {
      play("confirm-ui", { speed: 1.5 })
      go(1) //Restarts the game
    })
  }

  //Displays the end game screen with a message and replay option
  displayGameOverScreen() {
    bgSoundManager.pauseAllSounds()
    add([rect(1280, 720), color(0, 0, 0)])
    add([
      text("Game Over!", { size: 50, font: "Round" }),
      area(),
      anchor("center"),
      pos(center()),
    ])

    this.displayBlinkingUIMessage(
      "Press [ Enter ] to Start Game",
      vec2(center().x, center().y + 100)
    )

    onKeyPress("enter", () => {
      play("confirm-ui")
      go(1)
    })
  }

  displayEndGameScreen() {
    bgSoundManager.pauseAllSounds()
    add([rect(1280, 720), color(0, 0, 0)])
    add([
      text("You Won! Thanks for Playing.", { size: 50, font: "Round" }),
      area(),
      anchor("center"),
      pos(center()),
    ])

    this.displayBlinkingUIMessage(
      "Press [ Enter ] to Play Again",
      vec2(center().x, center().y + 100)
    )

    onKeyPress("enter", () => {
      play("confirm-ui")
      go("menu") // Goes back to the main menu
    })
  }

  // Adds a dark background overlay for UI elements
  addDarkBg() {
    add([rect(270, 130), color(0, 0, 0), fixed()])
  }
}

//Calling the funnction
export const UIManager = new UI()
