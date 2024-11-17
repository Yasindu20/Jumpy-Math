export class Camera {
  attachedObj = null //camara isn't attach to anything

  attach(gameObj, offsetX = 0, offsetY = 0, fixedX = null, fixedY = null) {
    this.attachedObj = gameObj // attach the game object to be tracked by the camera

    //checks if a fixed X value is provided but no fixed Y
    if (fixedX && !fixedY) {
      //Runs every frame
      onUpdate(() => {
        camPos(fixedX, this.attachedObj.pos.y + offsetY) //change camera position at fixed X and dynamic Y with offset
      })

      return //exit the attach function
    }

    //checks if a fixed Y value is provided but no fixed X
    if (!fixedX && fixedY) {
      onUpdate(() => {
        camPos(this.attachedObj.pos.x + offsetX, fixedY) //change camera position at fixed y and dynamic x with offset
      })

      return
    }

    //checks if both fixed X and Y are provided
    if (fixedX && fixedY) {
      onUpdate(() => {
        camPos(fixedX, fixedY) //ignore object movement
      })

      return
    }

    // Default behavior
    onUpdate(() => {
      camPos(this.attachedObj.pos.x + offsetX, this.attachedObj.pos.y + offsetY) //camera follows object
    })
  }
}
