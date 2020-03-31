    "use strict";
/* exported Scene */
class Scene extends UniformProvider {
  constructor(gl) {
    super("scene");
    this.programs = [];

    this.vsTextured = new Shader(gl, gl.VERTEX_SHADER, "textured-vs.glsl");    
    this.fsTextured = new Shader(gl, gl.FRAGMENT_SHADER, "textured-fs.glsl");
    this.vsTexturedAni = new Shader(gl, gl.VERTEX_SHADER, "textured-vs-ani.glsl");
    this.programs.push( 
        this.texturedProgram = new TexturedProgram(gl, this.vsTextured, this.fsTextured));
    this.vsBackground = new Shader(gl, gl.VERTEX_SHADER, "background-vs.glsl");
    this.programs.push( 
        this.backgroundProgram = new TexturedProgram(gl, this.vsBackground, this.fsTextured));
    this.programs.push(
        this.texturedAniProgram = new TexturedProgram(gl, this.vsTexturedAni, this.fsTextured));

    this.texturedQuadGeometry = new TexturedQuadGeometry(gl);    

    this.gameObjects = [];
    this.backgroundMaterial = new Material(this.backgroundProgram);
    this.backgroundMaterial.colorTexture.set(new Texture2D(gl, "media/background.jpg"));
    this.backgroundMesh = new Mesh(this.backgroundMaterial, this.texturedQuadGeometry);
    this.background = new GameObject( this.backgroundMesh );
    this.background.update = function(){};
    this.gameObjects.push(this.background);

    this.raiderMaterial = new Material(this.texturedProgram);
    this.raiderMaterial.colorTexture.set(new Texture2D(gl, "media/raider.png"));
    this.raiderMesh = new Mesh(this.raiderMaterial, this.texturedQuadGeometry);
    this.avatar = new GameObject( this.raiderMesh );
    this.avatar.position.set(-13, -13);
    this.gameObjects.push(this.avatar);

    this.asteroidMaterial = new Material(this.texturedProgram);
    this.asteroidMaterial.colorTexture.set(new Texture2D(gl, "media/asteroid.png"));
    this.asteroidMesh = new Mesh(this.asteroidMaterial, this.texturedQuadGeometry);

    this.explosionMaterial = new Material(this.texturedAniProgram);
    this.explosionMaterial.colorTexture.set(new Texture2D(gl, "media/boom.png"));

    this.explodingObjects = [];
    this.offset = new Vec2(0.0, 0.0);

    const genericMove = function(t, dt){
      const acceleration = new Vec3(this.force).mul(this.invMass);

      this.velocity.addScaled(dt, acceleration);
      const aheadVector = new Vec3(Math.cos(this.orientation), Math.sin(this.orientation));
      const aheadVelocity = aheadVector.times(aheadVector.dot(this.velocity));
      const sideVelocity = this.velocity.minus(aheadVelocity);

      this.velocity = new Vec3(0,0,0);
      this.velocity.addScaled(Math.exp(-dt * this.backDrag * this.invMass), aheadVelocity);
      this.velocity.addScaled(Math.exp(-dt * this.sideDrag * this.invMass), sideVelocity);
      this.position.addScaled(dt, this.velocity);

      this.angularAcceleration = this.torque * this.invAngularMass;
      this.angularVelocity += this.angularAcceleration * dt; 
      this.angularVelocity *= Math.exp(-dt * this.angularDrag * this.invAngularMass);
      this.orientation += this.angularVelocity * dt;
    };

    const genericControl = function(t, dt, keysPressed, colliders){
      for (const other of colliders){
        if (other === this){
          continue;
        }
        else{

          const posDiff = new Vec3();
          posDiff.setDifference(other.position, this.position);

          const dist2 = posDiff.dot(posDiff);

          if (dist2 <= (other.radius + this.radius)){ //collided
            if (other.explodable === true){
              other.exploding = true;
            }

            if (this.explodable === true){
              this.exploding = true;
            }

            const normal = posDiff.direction();

            const relVelocity = other.velocity.minus(this.velocity);

            const restitutionCoeff = 1.0;

            const impMag = normal.dot(relVelocity)/(other.invMass + this.invMass) * (1 + restitutionCoeff);

            this.position.addScaled(-0.05, normal);

            other.position.addScaled(0.05, normal);

            this.velocity.addScaled(impMag*this.invMass, normal);

            other.velocity.addScaled(-impMag*other.invMass, normal);
          }
        }
      }
    }; 

    for(let i=0; i < 64; i++){
      const asteroid = new GameObject( this.asteroidMesh);
      // asteroid.position.set(-10, -16);
      asteroid.position.setRandom(new Vec3(-12, -12, 0), new Vec3(12, 12, 0) );
      // asteroid.velocity.setRandom(new Vec3(-2, -2, 0), new Vec3(2, 2, 0));
      // asteroid.angularVelocity = Math.random(-2, 2);
      this.gameObjects.push(asteroid);
      asteroid.move = genericMove;
      asteroid.control = genericControl;
      asteroid.torque = 2;
      asteroid.radius = 2;
      asteroid.invMass = 1;
      asteroid.explodable = true;
    }

    this.avatar.invMass = 1;
    this.avatar.backDrag = 0.9;
    this.avatar.sideDrag = 0.5;
    this.avatar.angularDrag = 0.6;
    this.avatar.radius = 2;

    this.avatar.control = function(t, dt, keysPressed, colliders){
      this.aheadThrust = 0;
      this.sideThrust = 0;

      if(keysPressed["UP"]) {
        this.aheadThrust += 2;
      } 
      if(keysPressed["DOWN"]){
        this.aheadThrust -= 2;
      }
      this.sideThrust = 0;

      this.torque = 0;
      if(keysPressed["LEFT"]) {
        this.sideThrust += 2;
        this.torque += 1;
      } 
      if(keysPressed["RIGHT"]){
        this.sideThrust -= 2;
        this.torque -= 1;
      }

      const aheadVector = new Vec3(Math.cos(this.orientation), Math.sin(this.orientation), 0);
      const sideVector = new Vec3(-Math.sin(this.orientation), Math.cos(this.orientation), 0);

      this.force = aheadVector.times(this.aheadThrust).plus(sideVector.times(this.sideThrust));

      for (const other of colliders){
        if (other === this){
          continue;
        }
        else{
          const posDiff = new Vec3();
          posDiff.setDifference(other.position, this.position);

          const dist2 = posDiff.dot(posDiff);

          if (dist2 <= (other.radius + this.radius)){ //collided
            if (other.explodable === true){
              other.exploding = true;
            }

            if (this.explodable === true){
              this.exploding = true;
            }

            const normal = posDiff.direction();

            const relVelocity = other.velocity.minus(this.velocity);

            const restitutionCoeff = 1.0;

            const impMag = normal.dot(relVelocity)/(other.invMass + this.invMass) * (1 + restitutionCoeff);

            this.position.addScaled(-0.08, normal);

            other.position.addScaled(0.8, normal);

            this.velocity.addScaled(impMag*this.invMass, normal);

            other.velocity.addScaled(-impMag*other.invMass, normal);
          }
        }
      }
    };  

    this.avatar.move = genericMove;

    this.timeAtFirstFrame = new Date().getTime();
    this.timeAtLastFrame = this.timeAtFirstFrame;

    this.camera = new OrthoCamera(...this.programs); 
    this.addComponentsAndGatherUniforms(...this.programs);

    gl.enable(gl.BLEND);
    gl.blendFunc(
      gl.SRC_ALPHA,
      gl.ONE_MINUS_SRC_ALPHA);
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

    this.camera.position = this.avatar.position;
    this.camera.update();

    // clear the screen
    gl.clearColor(0.3, 0.0, 0.3, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for (const gameObject of this.gameObjects){ //new exploding object found
      if (gameObject.exploding === true && !this.explodingObjects.includes(gameObject)){
        this.explodingObjects.push(gameObject);
      }
    }

    if (this.offset.x < 5){
      this.offset.x += 1;
    }
    else{
      this.offset.x = 0;
      if (this.offset.y < 5){
        this.offset.y += 1;
      }
      else{ //objects ran through the explosion sequence, remove them
        while (this.explodingObjects.length !== 0){
          let temp = this.explodingObjects[0];
          this.explodingObjects.splice(this.explodingObjects.indexOf(temp), 1);
          this.gameObjects.splice(this.gameObjects.indexOf(temp), 1);
        }
        this.offset.x = 0;
        this.offset.y = 0;
      }
    }

    for(const gameObject of this.gameObjects) {
      gameObject.control(t, dt, keysPressed, this.gameObjects);
    }

    for(const gameObject of this.gameObjects) {
      gameObject.move(t, dt);
    }

    for(const gameObject of this.gameObjects) {
      gameObject.update();
    }
    for(const gameObject of this.gameObjects) {
      if (gameObject.exploding === true){ //object is exploding
        gameObject.using(this.explosionMaterial).draw(this, this.camera);
      }
      else{
        gameObject.draw(this, this.camera);
      }
    }
  }
}
