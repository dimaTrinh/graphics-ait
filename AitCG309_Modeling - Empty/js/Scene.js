"use strict";
/* exported Scene */
class Scene extends UniformProvider {
  constructor(gl) {
    super("scene");
    this.programs = [];

    this.fsTextured = new Shader(gl, gl.FRAGMENT_SHADER, "textured-fs.glsl");
    this.vsTextured = new Shader(gl, gl.VERTEX_SHADER, "textured-vs.glsl");    

    this.fsTexturedBackground = new Shader(gl, gl.FRAGMENT_SHADER, "textured-fs-background.glsl");
    this.vsTexturedBackGround = new Shader(gl, gl.VERTEX_SHADER, "textured-vs-background.glsl");  

    this.programs.push( 
    	this.texturedProgram = new TexturedProgram(gl, this.vsTextured, this.fsTextured));
    this.programs.push(this.backgroundProgram = new TexturedProgram(gl, this.vsTexturedBackGround, this.fsTexturedBackground));

    this.texturedQuadGeometry = new TexturedQuadGeometry(gl);    

    this.timeAtFirstFrame = new Date().getTime();
    this.timeAtLastFrame = this.timeAtFirstFrame;

    this.slowpokeMaterial = new Material(this.texturedProgram);
    this.slowpokeMaterial.colorTexture.set(new Texture2D(gl, 
        "./media/slowpoke/YadonDh.png"));
    this.slowpokeEyeMaterial = new Material(this.texturedProgram);
    this.slowpokeEyeMaterial.colorTexture.set(new Texture2D(gl, 
        "./media/slowpoke/YadonEyeDh.png"));

    this.envTexture = new TextureCube(gl, [
    "media/posx512.jpg",
    "media/negx512.jpg",
    "media/posy512.jpg",
    "media/negy512.jpg",
    "media/posz512.jpg",
    "media/negz512.jpg",]
    );

    this.backgroundMaterial = new Material(this.backgroundProgram);
    this.backgroundMaterial.envTexture.set(this.envTexture);

    this.material = new Material(this.texturedProgram);
    this.material.colorTexture.set(new Texture2D(gl, "./media/usa.jpg"));

    this.mesh = new Mesh(this.material, this.texturedQuadGeometry);
    this.slowpokeMesh = new MultiMesh(gl, 
        "./media/slowpoke/slowpoke.json", 
        [this.slowpokeMaterial, this.slowpokeEyeMaterial]);

    this.backgroundMesh = new Mesh(this.backgroundMaterial, this.texturedQuadGeometry);
    this.background = new GameObject(this.backgroundMesh);
    this.background.update = function(){};

    this.avatar = new GameObject(this.slowpokeMesh);
    this.gameObjects = [];
    this.gameObjects.push(this.avatar);
    this.gameObjects.push(this.background)
    this.avatar.scale.set(0.3, 0.3,0.3);
    this.avatar.yaw = 1.5;

    // for(let i=0; i<50; i++){
    //     const tri = new GameObject(this.mesh);
    //     tri.position.setRandom(new Vec3(-10, -10, 0.0), new Vec3(10, 10, 0.0));
    //     this.gameObjects.push(tri);
    // }

    this.camera = new PerspectiveCamera(...this.programs); 
    this.addComponentsAndGatherUniforms(...this.programs);
  }

  resize(gl, canvas) {
    gl.viewport(0, 0, canvas.width, canvas.height);
    this.camera.setAspectRatio(canvas.width / canvas.height);
    gl.enable(gl.DEPTH_TEST);
  }

  update(gl, keysPressed) {
    //jshint bitwise:false
    //jshint unused:false
    const timeAtThisFrame = new Date().getTime();
    const dt = (timeAtThisFrame - this.timeAtLastFrame) / 1000.0;
    const t = (timeAtThisFrame - this.timeAtFirstFrame) / 1000.0; 
    this.timeAtLastFrame = timeAtThisFrame;
    //this.time.set(t);
    this.time = t;

    if(keysPressed.A){
      this.gameObjects[0].position.x -= 0.5 * dt;
    }

    // clear the screen
    gl.clearColor(0.3, 0.0, 0.3, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.camera.move(dt, keysPressed);

    for(const gameObject of this.gameObjects) {
        gameObject.update();
    }
    
    for(const gameObject of this.gameObjects) {
        gameObject.draw(this, this.camera);
    }
  }
}
