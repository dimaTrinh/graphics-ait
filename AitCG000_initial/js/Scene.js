"use strict";
/* exported Scene */
function calcDist(u, v){
  return Math.sqrt(Math.abs(u.x-v.x)**2 + Math.abs(u.y-v.y)**2 + Math.abs(u.z-v.z)**2);
}

class Scene {
  constructor(gl) {
    this.vsIdle = new Shader(gl, gl.VERTEX_SHADER, "idle-vs.glsl");
    this.fsSolid = new Shader(gl, gl.FRAGMENT_SHADER, "solid-fs_2.glsl");
    this.stripedProgram = new Program(gl, this.vsIdle, this.fsSolid);

    //in Scene constructor:
    this.material = new Material(this.stripedProgram);

    this.material.stripeColor1.set(new Vec3(0.9, 0.2, 0.5));
    this.material.stripeColor2.set(new Vec3(0.6, 0.2, 0.1));
    this.material.stripeWidth = 0.1;

    this.yellowMaterial = new Material(this.stripedProgram);
    this.yellowMaterial.stripeColor1.set(new Vec3(0.2, 0.2, 0.2));
    this.yellowMaterial.stripeColor2.set(new Vec3(0.2, 0.6, 0.7));
    this.yellowMaterial.stripeWidth = 0.2;

    this.cyanMaterial = new Material(this.stripedProgram);
    this.cyanMaterial.stripeColor1.set(new Vec3(0.2, 0.3, 0.7));
    this.cyanMaterial.stripeColor2.set(new Vec3(0.6, 0.5, 0.2));
    this.cyanMaterial.stripeWidth = 0.15;

    this.triangleGeometry = new TriangleGeometry(gl);
    this.quadGeometry = new QuadGeometry(gl);
    this.starGeometry = new StarGeometry(gl);
    this.donutGeometry = new DonutGeometry(gl);
    this.heartGeometry = new HeartGeometry(gl);

    this.yellowHeart = new Mesh(this.yellowMaterial, this.heartGeometry);
    this.cyanHeart = new Mesh(this.cyanMaterial, this.heartGeometry);

    this.avatarPosition = new Vec3(0.0,0.0,0.0);
    this.avatarPosition2 = new Vec3(0.5, 0.5,0.0);

    this.gameObjects = [];

    this.gameObject1 = new GameObject(this.yellowHeart);
    this.gameObject2 = new GameObject(this.cyanHeart);

    this.gameObjects.push(this.gameObject1);
    this.gameObjects.push(this.gameObject2);

    this.timeAtFirstFrame = new Date().getTime();
    this.timeAtLastFrame = this.timeAtFirstFrame;

    this.avatarVelocity = new Vec3(0.0,0.0,0.0);

    this.avatarScale = new Vec3(2.0, 2.0, 1.0);

    this.avatarRotation = 0;
  }

  resize(gl, canvas) {
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  update(gl, keysPressed, mouseLoc) {
    //jshint bitwise:false
    //jshint unused:false

    // clear the screen
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    // gl.clearColor(Math.random(), Math.random(), Math.random(), 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //gl.useProgram(this.solidProgram.glProgram);

    //Retreive the time at this frame and the time between last frame and this frame
    const timeAtThisFrame = new Date().getTime();
    const timeNow = (timeAtThisFrame - this.timeAtFirstFrame) / 1000.0;
    const timePassed = (timeAtThisFrame - this.timeAtLastFrame) / 1000.0;
    this.timeAtLastFrame = timeAtThisFrame;

   // //Goes into VS, helps move the object around according to key pressed
   //  const modelMatrixHandle = gl.getUniformLocation(
   //  this.stripedProgram.glProgram, "gameObject.modelMatrix");
   //  if(modelMatrixHandle == null) {
   //    console.log("Could not find uniform gameObject.modelMatrix.");
   //  } else {

   //    // this.angleRotation = 0;
   //    // const step = 0.015;
   //    // if (keysPressed["UP"] === true){
   //    //     this.avatarPosition.add(new Vec3(0.0, step,0.0));
   //    //     this.avatarVelocity.add(new Vec3(0.0, step,0.0));
   //    //   }
   //    //   else if(keysPressed["DOWN"] === true){
   //    //     this.avatarPosition.add(new Vec3(0.0, -step,0.0));
   //    //     this.avatarVelocity.add(new Vec3(0.0,-step,0.0));
   //    //   }
   //    //   else if(keysPressed["LEFT"] === true){
   //    //     this.avatarPosition.add(new Vec3(-step, 0.0,0.0));
   //    //     this.angleRotation -= 5;
   //    //     this.avatarVelocity.add(new Vec3(-step,0.0,0.0));
   //    //   }
   //    //   else if(keysPressed["RIGHT"] === true){
   //    //     this.avatarPosition.add(new Vec3(step, 0.0,0.0));
   //    //     this.angleRotation += 5;
   //    //     this.avatarVelocity.add(new Vec3(step,0,0.0,0.0));
   //    //   }

   //    const modelMatrix = new Mat4();

   //    modelMatrix.scale(this.avatarScale);
      
   //    // this.avatarRotation = (this.avatarRotation+this.angleRotation)%360;
   //    // modelMatrix.rotate(this.avatarRotation*Math.PI/180);


   //    // this.avatarPosition.addScaled(timePassed, this.avatarVelocity, 0.0, 0.0);
   //    modelMatrix.translate(this.avatarPosition);

   //    modelMatrix.commit(gl, modelMatrixHandle);
   //  }

    // const modelMatrix2 = new Mat4();
    // modelMatrix2.scale(this.avatarScale);
    // modelMatrix2.translate(this.avatarPosition2);
    // modelMatrix2.commit(gl, modelMatrixHandle);

    this.gameObject1.scale.set(this.avatarScale);
    this.gameObject1.position.set(this.avatarPosition);

    this.gameObject2.scale.set(this.avatarScale);
    this.gameObject2.position.set(this.avatarPosition2);

    for (const gameObject of this.gameObjects){
      gameObject.update();
    }

     //Goes into FS, helps make the hypno effect
    const timeHandle1 = gl.getUniformLocation(this.stripedProgram.glProgram,"hypnoObject.timeNow");
    if(timeHandle1 === null) {
      console.log("Could not find uniform: timeHandle1"); 
    } else {
      gl.uniform1f(timeHandle1, timeNow); 
    } 

    //Goes into VS, helps make the distortion of object
    const timeHandle2 = gl.getUniformLocation(this.stripedProgram.glProgram,"gameObject.time");
    if(timeHandle2 === null) {
      console.log("Could not find uniform: timeHandle2"); 
    } else {
      gl.uniform1f(timeHandle2, timeNow); 
    } 

    for (const gameObject of this.gameObjects){
      gameObject.draw();
    }

   //  // Helps make the object wrap around the screen
   //  if(Math.abs(this.avatarPosition.x) > 1){
   //    if (this.avatarPosition.x > 1){
   //      this.avatarPosition.x = -1.0;
   //    }
   //    else{
   //      this.avatarPosition.x = 1.0;
   //    }
   //  }
   //  if(Math.abs(this.avatarPosition.y) > 1){
   //    if (this.avatarPosition.y > 1){
   //      this.avatarPosition.y = -1.0;
   //    }
   //    else{
   //      this.avatarPosition.y = 1.0;
   //    }
   //  }
  }
}
