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

    this.scene.selectedGameObjects.push(this.scene.gameObjects[this.currentObjectIndex]);

    this.objectCount = this.scene.gameObjects.length;

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
      if (keyNames[event.keyCode] === "Q"){
        this.objectCount = this.scene.gameObjects.length;
        this.currentObjectIndex = (this.currentObjectIndex+1)%this.objectCount;
        this.scene.selectedGameObjects.pop();
        this.scene.selectedGameObjects.push(this.scene.gameObjects[this.currentObjectIndex]);
      }

      //Controlling selected object's position
      const step = 0.03;
      if (keyNames[event.keyCode] === "UP"){
        this.scene.gameObjects[this.currentObjectIndex].position.add(new Vec3(0.0, step,0.0));
      }
      else if(keyNames[event.keyCode] === "DOWN"){
        this.scene.gameObjects[this.currentObjectIndex].position.add(new Vec3(0.0, -step,0.0));
      }
      else if(keyNames[event.keyCode] === "LEFT"){
        this.scene.gameObjects[this.currentObjectIndex].position.add(new Vec3(-step, 0.0,0.0));
      }
      else if(keyNames[event.keyCode] === "RIGHT"){
        this.scene.gameObjects[this.currentObjectIndex].position.add(new Vec3(step, 0.0,0.0));
      }

      //Rotating selected object
      const angleRotation = 0.2;
      if (keyNames[event.keyCode] === "A"){
        this.scene.gameObjects[this.currentObjectIndex].orientation += angleRotation;
      }
      else if(keyNames[event.keyCode] === "D"){
        this.scene.gameObjects[this.currentObjectIndex].orientation -= angleRotation;
      }
      if (keyNames[event.keyCode] === "DELETE"){
        this.scene.gameObjects.splice(this.currentObjectIndex, 1);
        this.objectCount = this.scene.gameObjects.length;
        this.currentObjectIndex = (this.currentObjectIndex+1)%this.objectCount;
        this.scene.selectedGameObjects.pop();
        this.scene.selectedGameObjects.push(this.scene.gameObjects[this.currentObjectIndex]);
      }

      //Change zoom of camera
      const zoomFactor = 0.05;
      if (keyNames[event.keyCode] === "Z"){
        this.scene.camera.scale -= zoomFactor;
        this.scene.camera.update();
      }
      else if(keyNames[event.keyCode] === "X"){
        this.scene.camera.scale += zoomFactor;
        this.scene.camera.update();
      }
    };

    document.onkeyup = (event) => {
      //jshint unused:false
      this.keysPressed[keyNames[event.keyCode]] = false;
    };
    this.canvas.onmousedown = (event) => {
      //jshint unused:falses
      let mouseLoc = new Vec2((event.x/this.canvas.clientWidth-0.5)*2.0, (event.y/this.canvas.clientHeight*-1-0.5)*2.0);
      console.log(mouseLoc.x, mouseLoc.y);
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