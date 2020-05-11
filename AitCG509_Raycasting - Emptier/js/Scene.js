"use strict";
/* exported Scene */
class Scene extends UniformProvider {
  constructor(gl) {
    super("scene");
    this.programs = [];

    this.vsQuad = new Shader(gl, gl.VERTEX_SHADER, "quad-vs.glsl");    
    this.fsTrace = new Shader(gl, gl.FRAGMENT_SHADER, "trace-fs.glsl");
    this.fsTextured = new Shader(gl, gl.FRAGMENT_SHADER, "textured-fs.glsl");
    this.vsTextured = new Shader(gl, gl.VERTEX_SHADER, "textured-vs.glsl");  
    this.programs.push( 
    	this.traceProgram = new TexturedProgram(gl, this.vsQuad, this.fsTrace));
    this.programs.push( 
      this.texturedProgram = new TexturedProgram(gl, this.vsTextured, this.fsTextured));

    this.texturedQuadGeometry = new TexturedQuadGeometry(gl);

    this.timeAtFirstFrame = new Date().getTime();
    this.timeAtLastFrame = this.timeAtFirstFrame;

    this.traceMaterial = new Material(this.traceProgram);
    this.envTexture = new TextureCube(gl, [
      "media/posx512.jpg",
      "media/negx512.jpg",
      "media/posy512.jpg",
      "media/negy512.jpg",
      "media/posz512.jpg",
      "media/negz512.jpg",]
      );

    this.traceMaterial.envTexture.set(this.envTexture);
    this.traceMesh = new Mesh(this.traceMaterial, this.texturedQuadGeometry);

    this.traceQuad = new GameObject(this.traceMesh);

    this.camera = new PerspectiveCamera(...this.programs); 
    this.camera.position.set(0, 5, 25);
    this.camera.update();

    this.slowpokeMaterial = new Material(this.texturedProgram);
    this.slowpokeMaterial.colorTexture.set(new Texture2D(gl, 
        "./media/slowpoke/YadonDh.png"));

    this.slowpokeEyeMaterial = new Material(this.texturedProgram);
    this.slowpokeEyeMaterial.colorTexture.set(new Texture2D(gl, 
        "./media/slowpoke/YadonEyeDh.png"));

    this.slowpokeMesh = new MultiMesh(gl, 
        "./media/slowpoke/slowpoke.json", 
        [this.slowpokeMaterial, this.slowpokeEyeMaterial]);

    this.avatar = new GameObject(this.slowpokeMesh);
    this.avatar.scale.set(0.3, 0.3, 0.3);
    this.avatar.yaw = 1.5;

    this.gameObjects = [];
    //this.gameObjects.push(this.avatar);

    this.clippedQuadrics = [];
    this.clippedQuadrics.push(
      new ClippedQuadric(this.clippedQuadrics.length, ...this.programs));
    this.clippedQuadrics[0].makeKing();
    this.clippedQuadrics[0].transform(new Mat4().set().scale(0.8, 1.5, 0.8).translate(new Vec3(-2.0, 0, -2.0)));

    this.clippedQuadrics.push(
      new ClippedQuadric(this.clippedQuadrics.length, ...this.programs));
    this.clippedQuadrics[1].makeUnitSphere();
    this.clippedQuadrics[1].transform(new Mat4().set().translate(new Vec3(5.0, 4.5, 0.0)));

    this.clippedQuadrics.push(
      new ClippedQuadric(this.clippedQuadrics.length, ...this.programs));
    this.clippedQuadrics[2].makePawn();
    this.clippedQuadrics[2].transformClipper(new Mat4().set().translate(new Vec3(0, -1, 0.0)));
    this.clippedQuadrics[2].transform(new Mat4().set().scale(1.5, 2.0, 2.0).translate(new Vec3(5.0, 4.0, 0.0)));
    this.addComponentsAndGatherUniforms(...this.programs);

    this.clippedQuadrics.push(
      new ClippedQuadric(this.clippedQuadrics.length, ...this.programs));
    this.clippedQuadrics[3].makeCrown();
    this.clippedQuadrics[3].transform(new Mat4().set().scale(1.2, 0.8, 1.2).translate(new Vec3(-2.0, 1.5, -2.0)));

    this.addComponentsAndGatherUniforms(...this.programs);

    this.lights = [];
    this.lights.push(new Light(this.lights.length, ...this.programs));
    this.lights[0].position.set(1, 1, 1, 0).normalize();
    this.lights[0].powerDensity.set(1, 1, 1);

    gl.enable(gl.DEPTH_TEST);
  }

  resize(gl, canvas) {
    gl.viewport(0, 0, canvas.width, canvas.height);
    this.camera.setAspectRatio(canvas.width / canvas.height);
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

    // clear the screen
    gl.clearColor(0.3, 0.0, 0.3, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.camera.move(dt, keysPressed);
		this.traceQuad.draw(this, this.camera, ... this.lights, ...this.clippedQuadrics);
  }
}
