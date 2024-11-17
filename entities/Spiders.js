export class Spiders {
  rangeX = 0
  rangeY = 800

  //Constructor accepts positions, amplitudes, velocities, and spider type
  constructor(positions, amplitudes, velocities, type) {
    this.amplitudes = amplitudes //Spider moving range
    this.velocities = velocities //Speed
    this.spiders = [] //Array to hold all spider instances

    //Create spider at each position
    for (const position of positions) {
      this.spiders.push(
        add([
          sprite(`spider-${type}`, { anim: "crawl" }), //Animation 
          pos(position),
          area({
            shape: new Rect(vec2(0, 4.5), 20, 6), //Sets the hitbox shape
            collisionIgnore: ["spiders"], //Ignores collisions with other spiders
          }),
          anchor("center"), //Centers the spider on the position
          body(), //affect for gravity
          scale(4),
          state("idle", ["idle", "crawl-left", "crawl-right"]), //states for movement
          offscreen(), //Prevents rendering when went to  the off-screen
          "spiders", //Tag for identify all spiders
        ])
      )
    }
  }

  //Moves spider to a direction in certain duration
  async crawl(spider, moveBy, duration) {
    if (spider.currAnim !== "crawl") spider.play("crawl") //Plays crawl animation if not already playing

    // Tweens animates to spider's x-position by moveBy over a set duration
    await tween(
      spider.pos.x, // Starting x-position
      spider.pos.x + moveBy, // Target x-position
      duration,
      (posX) => (spider.pos.x = posX), // Updates spider's position
      easings.easeOutSine // Smooths the movement
    )
  }

  // Sets the movement pattern for each spider
  setMovementPattern() {
    for (const [index, spider] of this.spiders.entries()) {
      //keep track to cancel event to prevent hear spider sounds in previous level
      const idle = spider.onStateEnter("idle", async (previousState) => {
        if (spider.currAnim !== "idle") spider.play("idle") //Plays idle animation

        // Pauses for 1 second before changing state
        await new Promise((resolve) => {
          setTimeout(() => resolve(), 1000)
        })

        // Changes the spider's state based on its previous movement
        if (previousState === "crawl-left") {
          spider.enterState("crawl-right") //Moves right if previously moving left
        } else {
          spider.jump() //jump action
          if (!spider.isOffScreen()) {
            play("spider-attack", { volume: 0.6 }) //Plays attack sound if spider is visible on screen
          }

          spider.enterState("crawl-left") //Moves left if previously moving right
        }
      })

      const crawlLeft = spider.onStateEnter("crawl-left", async () => {
        spider.flipX = false //Flips sprite to left

        await this.crawl(
          spider,
          -this.amplitudes[index], //Moves left by amplitude distance
          this.velocities[index] //duration based on velocity
        )
        spider.enterState("idle", "crawl-left") //Returns to idle after moving left
      })

      const crawlRight = spider.onStateEnter("crawl-right", async () => {
        spider.flipX = true

        await this.crawl(spider, this.amplitudes[index], this.velocities[index])
        spider.enterState("idle", "crawl-right")
      })

      // Cancels all state listeners when the scene changes to prevent memory leaks
      onSceneLeave(() => {
        idle.cancel()
        crawlLeft.cancel()
        crawlRight.cancel()
      })
    }
  }

  // Enables spiders to pass through one-way platforms
  enablePassthrough() {
    for (const spider of this.spiders) {
      // Prevents collision resolution when the spider is jumping
      spider.onBeforePhysicsResolve((collision) => {
        if (collision.target.is("passthrough") && spider.isJumping()) {
          collision.preventResolution()
        }
      })
    }
  }
}
