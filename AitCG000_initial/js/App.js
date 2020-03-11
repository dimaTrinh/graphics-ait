"use strict";
/* exported App */

function calcDist(u, v){
  return Math.sqrt(Math.abs(u.x-v.x)**2 + Math.abs(u.y-v.y)**2 + Math.abs(u.z-v.z)**2);
}


class App{
  constructor(canvas, overlay) {
    this.canvas = canvas;
    this.overlay = overlay;

    this.gl = canvas.getContext("webgl2"); 
  
    if (this.gl === null) {
      throw new Error("Browser does not support WebGL2");
    }

    this.keysPressed = {};

    this.gl.pendingResources = {};

    this.scene = new Scene(this.gl);

    this.currentObjectIndex = 0;

    //this.scene.selectedGameObjects.push(this.scene.gameObjects[this.currentObjectIndex]);
    this.startingObject = null;

    this.pressingNew = false;

    this.resize();

  }

  // match rendering resolution and viewport to the canvas size
  resize() {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    this.scene.resize(this.gl, this.canvas);
  }

  registerEventHandlers() {
    document.onkeydown = (event) => {
      //jshint unused:false
      this.keysPressed[keyNames[event.keyCode]] = true;

      //Switch between object
      if (this.scene.gameObjects.length !== 0){
        if (keyNames[event.keyCode] === "Q"){
          this.scene.selectedGameObjects.splice(this.scene.selectedGameObjects.indexOf(this.scene.gameObjects[this.currentObjectIndex]));
          this.startingObject = null;
          this.currentObjectIndex = (this.currentObjectIndex+1)%this.scene.gameObjects.length;
          if (!this.scene.selectedGameObjects.includes(this.scene.gameObjects[this.currentObjectIndex])){
            this.scene.selectedGameObjects.push(this.scene.gameObjects[this.currentObjectIndex]);
            if (!this.startingObject){
              this.startingObject = this.scene.gameObjects[this.currentObjectIndex];
              console.log("New starting object");
            } 
          }
        }
      }

      //Controlling selected object's position
      if (this.scene.gameObjects.length !== 0){
        const step = 0.03;
        if (keyNames[event.keyCode] === "UP"){
          for (const gameObject of this.scene.selectedGameObjects){
            gameObject.position.add(new Vec3(0.0, step,0.0));
          }
        }
        else if(keyNames[event.keyCode] === "DOWN"){
          for (const gameObject of this.scene.selectedGameObjects){
            gameObject.position.add(new Vec3(0.0, -step,0.0));
          }
        }
        else if(keyNames[event.keyCode] === "LEFT"){
          for (const gameObject of this.scene.selectedGameObjects){
            gameObject.position.add(new Vec3(-step, 0.0,0.0));
          }
        }
        else if(keyNames[event.keyCode] === "RIGHT"){
          for (const gameObject of this.scene.selectedGameObjects){
            gameObject.position.add(new Vec3(step, 0.0,0.0));
          }
        }
      }

      //Rotating selected object
      if (this.scene.gameObjects.length !== 0){
        const angleRotation = 0.2;
        if (keyNames[event.keyCode] === "A"){
          for (const gameObject of this.scene.selectedGameObjects){
            gameObject.orientation += angleRotation;
          }
        }
        else if(keyNames[event.keyCode] === "D"){
          for (const gameObject of this.scene.selectedGameObjects){
            gameObject.orientation -= angleRotation;
          }
        }
      }

      //Delete selected objects
      if (this.scene.gameObjects.length !== 0){
        if (keyNames[event.keyCode] === "DELETE"){
          let iter = 0;
          while (this.scene.selectedGameObjects.length !== 0){
            let temp = this.scene.selectedGameObjects[iter];
            this.scene.selectedGameObjects.splice(this.scene.selectedGameObjects.indexOf(temp), 1);
            this.scene.gameObjects.splice(this.scene.gameObjects.indexOf(temp), 1);
            this.currentObjectIndex = (this.currentObjectIndex+1)%this.scene.gameObjects.length;
          }
          if (this.scene.gameObjects.length === 0){ //no objects left, reset to 0
            this.currentObjectIndex = 0;
          }
        }
      }

      //Link objects together
      if (this.scene.gameObjects.length !== 0){
        if (keyNames[event.keyCode] === "Y"){
          if (this.startingObject){
            for (const gameObject of this.scene.selectedGameObjects){
              if (gameObject !== this.startingObject){
                gameObject.parent = this.startingObject;
              }
            }
          }   
        }
      }

      //Unlink objects 
      if (this.scene.gameObjects.length !== 0){
        if (keyNames[event.keyCode] === "U"){
          for (const gameObject of this.scene.selectedGameObjects){
              gameObject.parent = null;
          }
        }
      }

      //Change zoom of camera
      const zoomFactor = 0.1;
      if (keyNames[event.keyCode] === "Z"){
        this.scene.camera.scale *= (1+zoomFactor);
        this.scene.camera.update();
      }
      else if(keyNames[event.keyCode] === "X"){
        this.scene.camera.scale *= (1-zoomFactor);
        this.scene.camera.update();
      }

      //Create new object at the center of canvas
      if (keyNames[event.keyCode] === "N"){
        if (this.pressingNew === false){
          let invertCameraMatrix = new Mat4(this.scene.camera.viewProjMatrix).invert();
          let centerCanvas = new Vec2(0,0);
          let centerLoc = centerCanvas.xy01mul(invertCameraMatrix); //find where the location that is going to be shifted to the center of the canvas going to be
          
          let newObject = new GameObject(this.scene.cyanHeart);
          newObject.position.set(new Vec3(centerLoc.x, centerLoc.y, 0));
          newObject.scale.set(new Vec3(2, 2, 1));
          this.scene.gameObjects.push(newObject);
          this.pressingNew = true;
        }
      }

      //Control camera movement
      const cameraStep = 0.04;
      if (keyNames[event.keyCode] === "I"){
        let invertCameraMatrix = new Mat4(this.scene.camera.viewProjMatrix).invert();
        let worldStep = (new Vec3(0.0, cameraStep, 0.0)).xyz0mul(invertCameraMatrix); //finding out how much to add in world position
        this.scene.camera.position.add(worldStep);
        this.scene.camera.update();
      }
      else if(keyNames[event.keyCode] === "J"){
        let invertCameraMatrix = new Mat4(this.scene.camera.viewProjMatrix).invert();
        let worldStep = (new Vec3(-cameraStep,0.0, 0.0)).xyz0mul(invertCameraMatrix);
        this.scene.camera.position.add(worldStep);
        this.scene.camera.update();
      }
      else if(keyNames[event.keyCode] === "K"){
        let invertCameraMatrix = new Mat4(this.scene.camera.viewProjMatrix).invert();
        let worldStep = (new Vec3(0.0, -cameraStep, 0.0)).xyz0mul(invertCameraMatrix);
        this.scene.camera.position.add(worldStep);
        this.scene.camera.update();
      }
      else if(keyNames[event.keyCode] === "L"){
        let invertCameraMatrix = new Mat4(this.scene.camera.viewProjMatrix).invert();
        let worldStep = (new Vec3(cameraStep, 0.0, 0.0)).xyz0mul(invertCameraMatrix);
        this.scene.camera.position.add(worldStep);
        this.scene.camera.update();
      }
    };

    document.onkeyup = (event) => {
      //jshint unused:false
      this.keysPressed[keyNames[event.keyCode]] = false;
      if (keyNames[event.keyCode] === "N"){
        this.pressingNew = false;
      }
    };
    this.canvas.onmousedown = (event) => {
      //jshint unused:falses

      //Calculating where the mouse click happened in World Position
      let mouseLocCamera = new Vec2((event.x/this.canvas.clientWidth-0.5)*2.0, (event.y/this.canvas.clientHeight*-1+0.5)*2.0);
      let invertCameraMatrix = new Mat4(this.scene.camera.viewProjMatrix).invert();
      mouseLocCamera.xy01mul(invertCameraMatrix);
      let mouseLocWorld = new Vec3(mouseLocCamera.x, mouseLocCamera.y, 0);

      //Checking if the user clicked near the object
      let anySelection = false; //denote whether a click was detected any objects
      for (const gameObject of this.scene.gameObjects){
        if (calcDist(gameObject.position, mouseLocWorld) <= gameObject.radius){
          if (!this.scene.selectedGameObjects.includes(gameObject)){
           this.scene.selectedGameObjects.push(gameObject);
           if (!this.startingObject){
              this.startingObject = gameObject;
              console.log("New starting object");
            } 
          }
          anySelection = true;
        }
      }

      //No object was selected
      if (!anySelection){
        for (const gameObject of this.scene.gameObjects){
          this.scene.selectedGameObjects.splice(this.scene.selectedGameObjects.indexOf(gameObject), 1);
        }
        this.startingObject = null;
        //this.scene.selectedGameObjects.push(this.scene.gameObjects[this.currentObjectIndex]);        
      }
    };

    this.canvas.onmousemove = (event) => {
      //jshint unused:false
      event.stopPropagation();
    };
    this.canvas.onmouseout = (event) => {
      //jshint unused:false
    };
    this.canvas.onmouseup = (event) => {
      //jshint unused:false
    };
    window.addEventListener('resize', () => this.resize() );
    window.requestAnimationFrame( () => this.update() );
  }

  // animation frame update
  update() {
    const pendingResourceNames = Object.keys(this.gl.pendingResources);
    if (pendingResourceNames.length === 0) {
      this.scene.update(this.gl, this.keysPressed, this.mouseLocation);
      this.overlay.innerHTML = "Ready.";
    } else {
      this.overlay.innerHTML =
       `<font color="red">Loading: ${pendingResourceNames}</font>`;
    }

    // refresh
    window.requestAnimationFrame( () => this.update() );

    // if (this.scene.gameEnded === true){
    //   this.overlay.innerHTML = `<div style= "position:absolute;left:${this.textLeft}px;bottom:-${this.textBottom}px"> GAME OVER </div>`;
    // }
    // //For in class example
    // if (this.keysPressed["T"] === true){
    //   this.currentFontSize--;
    // }
    // else if(this.keysPressed["G"] === true){
    //   this.currentFontSize++;
    // }
    // this.overlay.innerHTML = `<div style= "position:absolute;left:${this.textLeft}px;bottom:-${this.textBottom}px"> <font size="${this.currentFontSize}px">Hello AIT! </font></div>`;
    this.overlay.innerHTML = `<div style= "position:absolute;left:${this.textLeft}px;bottom:-${this.textBottom}px"> ${JSON.stringify(this.keysPressed)} </div>`;
  }
}

// entry point from HTML
window.addEventListener('load', () => {
  const canvas = document.getElementById("canvas");
  const overlay = document.getElementById("overlay");
  overlay.innerHTML = `<font color="red">Hello JavaScript!</font>`;

  const app = new App(canvas, overlay);
  app.registerEventHandlers();
});