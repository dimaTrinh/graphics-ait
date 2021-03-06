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

    this.fsShadow = new Shader(gl, gl.FRAGMENT_SHADER, "shadow-fs.glsl");
    this.vsShadow = new Shader(gl, gl.VERTEX_SHADER, "shadow-vs.glsl");   

    this.fsGround = new Shader(gl, gl.FRAGMENT_SHADER, "textured-fs-ground.glsl");

    this.fsProced = new Shader(gl, gl.FRAGMENT_SHADER, "textured-fs-proced.glsl");

    this.fsMirror = new Shader(gl, gl.FRAGMENT_SHADER, "textured-fs-mirror.glsl");

    this.fsPertubed = new Shader(gl, gl.FRAGMENT_SHADER, "textured-fs-pertubed.glsl");

    this.programs.push( 
    	this.texturedProgram = new TexturedProgram(gl, this.vsTextured, this.fsTextured));
    this.programs.push(this.backgroundProgram = new TexturedProgram(gl, this.vsTexturedBackGround, this.fsTexturedBackground));
    this.programs.push(this.shadowProgram = new TexturedProgram(gl, this.vsShadow, this.fsShadow));
    this.programs.push(this.groundProgram = new TexturedProgram(gl, this.vsTextured, this.fsGround));
    this.programs.push(this.procedProgram = new TexturedProgram(gl, this.vsTextured, this.fsProced));
    this.programs.push(this.mirrorProgram = new TexturedProgram(gl, this.vsTextured, this.fsMirror));
    this.programs.push(this.pertubedProgram = new TexturedProgram(gl, this.vsTextured, this.fsPertubed));

    this.texturedQuadGeometry = new TexturedQuadGeometry(gl);    
    this.planeGeometry = new PlaneGeometry(gl);

    this.timeAtFirstFrame = new Date().getTime();
    this.timeAtLastFrame = this.timeAtFirstFrame;

    this.slowpokeMaterial = new Material(this.texturedProgram);
    this.slowpokeMaterial.colorTexture.set(new Texture2D(gl, 
        "./media/slowpoke/YadonDh.png"));
    this.slowpokeMaterial.specularColor = new Vec3(1.0,1.0,1.0);
    this.slowpokeMaterial.shininess = 10.0;

    this.slowpokeEyeMaterial = new Material(this.texturedProgram);
    this.slowpokeEyeMaterial.colorTexture.set(new Texture2D(gl, 
        "./media/slowpoke/YadonEyeDh.png"));
    this.slowpokeEyeMaterial.specularColor = new Vec3(1.0,1.0,1.0);
    this.slowpokeEyeMaterial.shininess = 10.0;

    this.slowpokeMaterialPertubed = new Material(this.pertubedProgram);
    this.slowpokeMaterialPertubed.colorTexture.set(new Texture2D(gl, 
        "./media/slowpoke/YadonDh.png"));

    this.slowpokeEyeMaterialPertubed = new Material(this.pertubedProgram);
    this.slowpokeEyeMaterialPertubed.colorTexture.set(new Texture2D(gl, 
        "./media/slowpoke/YadonEyeDh.png"));

    this.envTexture = new TextureCube(gl, [
    "media/posx512.jpg",
    "media/negx512.jpg",
    "media/posy512.jpg",
    "media/negy512.jpg",
    "media/posz512.jpg",
    "media/negz512.jpg",]
    );

    this.skyCubeTexture = new TextureCube(gl, [
        "media/posx512.jpg",
        "media/negx512.jpg",
        "media/posy512.jpg",
        "media/negy512.jpg",
        "media/posz512.jpg",
        "media/negz512.jpg",]
    );
    this.mirrorMaterial = new Material(this.mirrorProgram);
    this.mirrorMaterial.envmapTexture.set(this.skyCubeTexture);

    this.backgroundMaterial = new Material(this.backgroundProgram);
    this.backgroundMaterial.envTexture.set(this.envTexture);

    this.shadowMaterial = new Material(this.shadowProgram);

    this.procedMaterial = new Material(this.procedProgram);
    this.procedMaterial.color1.set(new Vec3(1.0,1.0,1.0));
    this.procedMaterial.color2.set(new Vec3(0.0,0.0,1.0));
    this.procedMaterial.freq = 15;
    this.procedMaterial.noiseFreq = 25;
    this.procedMaterial.noiseExp = 3;
    this.procedMaterial.noiseAmp = 20;

    this.groundMaterial = new Material(this.groundProgram);
    this.groundMaterial.colorTexture.set(new Texture2D(gl, "./media/ground.jpg"));

    this.slowpokeMesh = new MultiMesh(gl, 
        "./media/slowpoke/slowpoke.json", 
        [this.slowpokeMaterial, this.slowpokeEyeMaterial]);

    this.slowpokeMesh2 = new MultiMesh(gl, 
        "./media/slowpoke/slowpoke.json", 
        [this.procedMaterial, this.procedMaterial]);

    this.slowpokeMesh3 = new MultiMesh(gl, "./media/slowpoke/slowpoke.json", 
        [this.mirrorMaterial, this.mirrorMaterial]);

    this.slowpokeMeshPertubed = new MultiMesh(gl, "./media/slowpoke/slowpoke.json", 
        [this.slowpokeMaterialPertubed, this.slowpokeEyeMaterialPertubed]);

    this.backgroundMesh = new Mesh(this.backgroundMaterial, this.texturedQuadGeometry);
    this.background = new GameObject(this.backgroundMesh);
    this.background.update = function(){};
    this.background.noShadow = true;

    this.groundMesh = new Mesh(this.groundMaterial, this.planeGeometry);
    this.ground = new GameObject(this.groundMesh);
    this.ground.update = function(){};
    this.ground.noShadow = true;

    this.lights = [];
    this.lights.push(new Light(this.lights.length, ...this.programs));
    this.lights[0].position.set(1, 1, 1, 0).normalize();
    this.lights[0].powerDensity.set(0.5, 0.6, 0.3);

    this.lights.push(new Light(this.lights.length, ...this.programs));
    this.lights[1].position.set(-1, -1, 1, 0).normalize();
    this.lights[1].powerDensity.set(1, 1, 1);

    this.lights.push(new Light(this.lights.length, ...this.programs));
    this.lights[2].position.set(0, 8, 10, 1).normalize();
    this.lights[2].powerDensity.set(1, 1, 1);

    const esp = 0.05;
    const lightDirection = new Vec4(20,9,-5,0);
    const A = -lightDirection.x/lightDirection.y;
    const B = -lightDirection.z/lightDirection.y;
    this.shadowMatrix = new Mat4( 
            1 ,    0    ,      0       ,   0, 
            A    ,  0 ,      B       ,   0, 
            0    ,    0    ,  1 ,  0, 
            0    ,    esp    ,  0 ,   1); 

    this.avatar = new GameObject(this.slowpokeMesh);
    this.avatar.scale.set(0.3, 0.3,0.3);
    this.avatar.yaw = 1.5;

    this.object2 = new GameObject(this.slowpokeMeshPertubed);
    this.object2.position.set(12, 0, 0);
    this.object2.parent = this.avatar;

    this.object3 = new GameObject(this.slowpokeMesh3);
    this.object3.position.set(-12, 0, 0);
    this.object3.parent = this.avatar;

    this.gameObjects = [];
    this.gameObjects.push(this.avatar);
    this.gameObjects.push(this.object2);
    this.gameObjects.push(this.object3);
    this.gameObjects.push(this.background)
    this.gameObjects.push(this.ground);

    this.background.move = function(){};
    this.ground.move = function(){};

    // for(let i=0; i<50; i++){
    //     const tri = new GameObject(this.mesh);
    //     tri.position.setRandom(new Vec3(-10, -10, 0.0), new Vec3(10, 10, 0.0));
    //     this.gameObjects.push(tri);
    // }

    this.camera = new PerspectiveCamera(...this.programs); 
    this.camera.parent = this.avatar;
    this.camera.update();

    this.addComponentsAndGatherUniforms(...this.programs);
    
    this.shadowMatrix = new Mat4( 
            1 ,    0    ,      0       ,   0, 
            A    ,  0 ,      B       ,   0, 
            0    ,    0    ,  1 ,  0, 
            0    ,    esp    ,  0 ,   1);
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
    
    this.avatar.move(dt, keysPressed);
    this.camera.update();

    for(const gameObject of this.gameObjects) {
        gameObject.update();
    }

    for(const gameObject of this.gameObjects) {
        gameObject.draw(this, this.camera, ... this.lights);
    }

    for(const gameObject of this.gameObjects) {
      if(!gameObject.noShadow){ // ground, background need no shadow
        gameObject.using(this.shadowMaterial).draw(this, this.camera);
      }
    }
  }
}
