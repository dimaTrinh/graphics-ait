"use strict";
/* exported Scene */

class Scene extends UniformProvider{
  constructor(gl) {
    super("scene");
    this.programs = [];
    this.vsIdle = new Shader(gl, gl.VERTEX_SHADER, "idle-vs.glsl");
    this.fsSolid = new Shader(gl, gl.FRAGMENT_SHADER, "solid-fs_2.glsl");
    this.stripedProgram = new Program(gl, this.vsIdle, this.fsSolid);
    this.programs.push(this.stripedProgram);

    this.vsTextured = new Shader(gl, gl.VERTEX_SHADER, "textured-vs.glsl");
    this.fsTextured = new Shader(gl, gl.FRAGMENT_SHADER, "textured-fs.glsl");
    this.texturedProgram = new TexturedProgram(gl, this.vsTextured, this.fsTextured);
    this.programs.push(this.texturedProgram);

    this.cyanMaterial = new Material(this.stripedProgram);
    this.cyanMaterial.stripeColor1.set(new Vec3(0.2, 0.2, 0.2));
    this.cyanMaterial.stripeColor2.set(new Vec3(0.2, 0.6, 0.7));
    this.cyanMaterial.stripeWidth = 0.2;

    this.yellowMaterial = new Material(this.stripedProgram);
    this.yellowMaterial.stripeColor1.set(new Vec3(0.2, 0.3, 0.7));
    this.yellowMaterial.stripeColor2.set(new Vec3(0.6, 0.5, 0.2));
    this.yellowMaterial.stripeWidth = 0.2;

    this.texturedMaterial = new Material(this.texturedProgram);

    this.asteroidTexture = new Texture2D(gl, "media/asteroid.jpg");
    this.texturedMaterial.colorTexture.set(this.asteroidTexture);

    this.triangleGeometry = new TriangleGeometry(gl);
    this.quadGeometry = new QuadGeometry(gl);
    this.starGeometry = new StarGeometry(gl);
    this.donutGeometry = new DonutGeometry(gl);
    this.heartGeometry = new HeartGeometry(gl);
    this.texturedQuadGeometry = new TexturedQuadGeometry(gl);

    this.cyanHeart = new Mesh(this.cyanMaterial, this.heartGeometry);
    this.yellowHeart = new Mesh(this.yellowMaterial, this.heartGeometry);
    this.texturedQuad = new Mesh(this.texturedMaterial, this.texturedQuadGeometry);

    this.avatarPosition = new Vec3(-0.5, 1, 0);
    this.avatarPosition2 = new Vec3(0.5, 0.5,0.0);
    this.avatarPosition3 = new Vec3(0.5, -0.5, 0.0);
    this.avatarPosition4 = new Vec3(-0.3, -1, 0.0);

    this.avatarScale = new Vec3(2.0, 2.0, 1.0);
    this.objectScale = new Vec3(0.25, 0.25, 1.0);

    this.gameObjects = [];
    this.selectedGameObjects = [];

    this.gameObject1 = new GameObject(this.cyanHeart);
    this.gameObject2 = new GameObject(this.cyanHeart);
    this.gameObject3 = new GameObject(this.cyanHeart);
    this.gameObject4 = new GameObject(this.texturedQuad);

    this.gameObject1.scale.set(this.avatarScale);
    this.gameObject1.position.set(this.avatarPosition);

    this.gameObject2.scale.set(this.avatarScale);
    this.gameObject2.position.set(this.avatarPosition2);

    this.gameObject3.scale.set(this.avatarScale);
    this.gameObject3.position.set(this.avatarPosition3);

    this.gameObject4.scale.set(this.objectScale);
    this.gameObject4.orientation = 0.8;
    this.gameObject4.position.set(this.avatarPosition4);

    this.gameObjects.push(this.gameObject1);
    this.gameObjects.push(this.gameObject2);
    this.gameObjects.push(this.gameObject3);
    this.gameObjects.push(this.gameObject4);

    this.timeAtFirstFrame = new Date().getTime();
    this.timeAtLastFrame = this.timeAtFirstFrame;

    this.time;

    this.avatarVelocity = new Vec3(0.0,0.0,0.0);

    this.avatarRotation = 0;

    this.camera = new OrthoCamera(...this.programs);

    this.addComponentsAndGatherUniforms(...this.programs);
  }

  resize(gl, canvas) {
    gl.viewport(0, 0, canvas.width, canvas.height);
    this.camera.setAspectRatio(canvas.clientWidth / canvas.clientHeight );
  }

  update(gl, keysPressed) {
    //jshint bitwise:false
    //jshint unused:false

    // clear the screen
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    // gl.clearColor(Math.random(), Math.random(), Math.random(), 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //Retreive the time at this frame and the time between last frame and this frame
    const timeAtThisFrame = new Date().getTime();
    this.time = (timeAtThisFrame - this.timeAtFirstFrame) / 1000.0;
    const timePassed = (timeAtThisFrame - this.timeAtLastFrame) / 1000.0;
    this.timeAtLastFrame = timeAtThisFrame;

    for (const gameObject of this.gameObjects){
      gameObject.update();
    }

    for (const gameObject of this.gameObjects){
      gameObject.draw(this, this.camera);
    }

    for(const gameObject of this.selectedGameObjects) {
      gameObject.using(this.yellowMaterial).draw(this, this.camera);
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
