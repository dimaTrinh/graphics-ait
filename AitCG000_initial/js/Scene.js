"use strict";
/* exported Scene */
function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function calcDist(u, v){
  return Math.sqrt(Math.abs(u.x-v.x)**2 + Math.abs(u.y-v.y)**2 + Math.abs(u.z-v.z)**2);
}

class Scene {
  constructor(gl) {
    this.vsIdle = new Shader(gl, gl.VERTEX_SHADER, "idle-vs.glsl");
    this.fsSolid = new Shader(gl, gl.FRAGMENT_SHADER, "solid-fs_2.glsl");
    this.solidProgram = new Program(gl, this.vsIdle, this.fsSolid);
    this.triangleGeometry = new TriangleGeometry(gl);
    this.quadGeometry = new QuadGeometry(gl);
    this.starGeometry = new StarGeometry(gl);
    this.donutGeometry = new DonutGeometry(gl);
    this.heartGeometry = new HeartGeometry(gl);

    this.avatarPosition = new Vec3(0.0,0.0,0.0);

    this.timeAtFirstFrame = new Date().getTime();
    this.timeAtLastFrame = this.timeAtFirstFrame;

    this.avatarVelocity = new Vec3(0.0,0.0,0.0);

    this.avatarScale = new Vec3(0.5, 0.8, 1.0);

    this.avatarRotation = 0;
    this.angleRotation = 0;

    this.avatarRadius = 0.18;
    this.objectRadius = 0.15;
    this.gameEnded = false;
  }

  resize(gl, canvas) {
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  update(gl, keysPressed) {
    //jshint bitwise:false
    //jshint unused:false

    // clear the screen
    gl.clearColor(0.2, 0.3, 0.5, 1.0);
    // gl.clearColor(Math.random(), Math.random(), Math.random(), 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    gl.useProgram(this.solidProgram.glProgram);

    //Retreive the time at this frame and the time between last frame and this frame
    const timeAtThisFrame = new Date().getTime();
    const timeNow = (timeAtThisFrame - this.timeAtFirstFrame) / 1000.0;
    const timePassed = (timeAtThisFrame - this.timeAtLastFrame) / 1000.0;
    this.timeAtLastFrame = timeAtThisFrame;


   // //Goes into VS, helps move the object around according to key pressed
    const modelMatrixHandle = gl.getUniformLocation(
    this.solidProgram.glProgram, "gameObject.modelMatrix");
    if(modelMatrixHandle == null) {
      console.log("Could not find uniform gameObject.modelMatrix.");
    } else {

      this.angleRotation = 0;
      const step = 0.015;
      if (keysPressed["UP"] === true){
          this.avatarPosition.add(new Vec3(0.0, step,0.0));
          this.avatarVelocity.add(new Vec3(0.0, step,0.0));
        }
        else if(keysPressed["DOWN"] === true){
          this.avatarPosition.add(new Vec3(0.0, -step,0.0));
          this.avatarVelocity.add(new Vec3(0.0,-step,0.0));
        }
        else if(keysPressed["LEFT"] === true){
          this.avatarPosition.add(new Vec3(-step, 0.0,0.0));
          this.angleRotation -= 5;
          this.avatarVelocity.add(new Vec3(-step,0.0,0.0));
        }
        else if(keysPressed["RIGHT"] === true){
          this.avatarPosition.add(new Vec3(step, 0.0,0.0));
          this.angleRotation += 5;
          this.avatarVelocity.add(new Vec3(step,0,0.0,0.0));
        }

      const modelMatrix = new Mat4();

      modelMatrix.scale(this.avatarScale);
      
      this.avatarRotation = (this.avatarRotation+this.angleRotation)%360;
      modelMatrix.rotate(this.avatarRotation*Math.PI/180);


      this.avatarPosition.addScaled(timePassed, this.avatarVelocity, 0.0, 0.0);
      modelMatrix.translate(this.avatarPosition);

      modelMatrix.commit(gl, modelMatrixHandle);
    }


    //Stripe stuff that goes into FS
    const color1 = {x: Math.random(), y: Math.random(), z:Math.random()};
    const color1Handle = gl.getUniformLocation(this.solidProgram.glProgram,"stripedObject.stripeColor1");
    if(color1Handle === null) {
      console.log("Could not find uniform: color1Handle."); 
    } else {
      gl.uniform3f(color1Handle, color1.x, color1.y, color1.z); 
    }     

    const color2 = {x: Math.random(), y: Math.random(), z:Math.random()};
    const color2Handle = gl.getUniformLocation(this.solidProgram.glProgram,"stripedObject.stripeColor2");
    if(color2Handle === null) {
      console.log("Could not find uniform: color2Handle."); 
    } else {
      gl.uniform3f(color2Handle, color2.x, color2.y, color2.z); 
    }     

    const stripeWidth = gl.getUniformLocation(this.solidProgram.glProgram,"stripedObject.stripeWidth");
    if(stripeWidth === null) {
      console.log("Could not find uniform: stripeWidth"); 
    } else {
      gl.uniform1f(stripeWidth, 0.2); 
    }  

    //Goes into FS, helps make the hypno effect
    const timeHandle1 = gl.getUniformLocation(this.solidProgram.glProgram,"hypnoObject.timeNow");
    if(timeHandle1 === null) {
      console.log("Could not find uniform: timeHandle1"); 
    } else {
      gl.uniform1f(timeHandle1, timeNow); 
    } 

    //Goes into VS, helps make the distortion of object
    const timeHandle2 = gl.getUniformLocation(this.solidProgram.glProgram,"gameObject.time");
    if(timeHandle2 === null) {
      console.log("Could not find uniform: timeHandle2"); 
    } else {
      gl.uniform1f(timeHandle2, timeNow); 
    } 

    // Helps make the object wrap around the screen
    if(Math.abs(this.avatarPosition.x) > 1){
      if (this.avatarPosition.x > 1){
        this.avatarPosition.x = -1.0;
      }
      else{
        this.avatarPosition.x = 1.0;
      }
    }
    if(Math.abs(this.avatarPosition.y) > 1){
      if (this.avatarPosition.y > 1){
        this.avatarPosition.y = -1.0;
      }
      else{
        this.avatarPosition.y = 1.0;
      }
    }

    this.donutGeometry.draw();
    this.heartGeometry.draw();
    
    // //Collision detections
    // if ((calcDist(this.objectPosition1,this.avatarPosition) <= (this.objectRadius+this.objectRadius))
    //   || (calcDist(this.objectPosition2,this.avatarPosition) <= (this.objectRadius+this.objectRadius))
    //   || (calcDist(this.objectPosition3,this.avatarPosition) <= (this.objectRadius+this.objectRadius))){
    //   //stop the objects from moving
    //   this.avatarVelocity = new Vec3(0.0,0.0,0.0);
    //   this.objectVelocity = new Vec3(0.0,0.0,0.0);
    //   this.gameEnded = true;
    // }
  }
}
