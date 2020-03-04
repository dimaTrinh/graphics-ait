"use strict";
/* exported App */
class App{
  constructor(canvas, overlay) {
    this.canvas = canvas;
    this.overlay = overlay;

    this.gl = canvas.getContext("webgl2"); 
  
    if (this.gl === null) {
      throw new Error("Browser does not support WebGL2");
    }

    this.mouseLocation = {x: 0, y: 0};
    this.keysPressed = {};

    this.gl.pendingResources = {};

    this.scene = new Scene(this.gl);

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
    };
    document.onkeyup = (event) => {
      //jshint unused:false
      this.keysPressed[keyNames[event.keyCode]] = false;
    };
    this.canvas.onmousedown = (event) => {
      //jshint unused:false
      this.mouseLocation.x = event.x;
      this.mouseLocation.y = event.y;
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
    //this.overlay.innerHTML = `<div style= "position:absolute;left:${this.textLeft}px;bottom:-${this.textBottom}px"> ${JSON.stringify(this.keysPressed)} </div>`;
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