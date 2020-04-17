"use strict"; 
/* exported GameObject */
class GameObject extends UniformProvider {
  constructor(mesh) { 
    super("gameObject");

    this.position = new Vec3(0, 0, 0); 
    this.roll = 0;
    this.pitch = 0;
    this.yaw = 0;
    this.scale = new Vec3(1, 1, 1); 
    this.noShadow = false;
    this.modelMatrix = new Mat4();

    this.speed = 10; 

    this.ahead = new Vec3(0.0, 0.0, -1.0); 
    this.right = new Vec3(1.0, 0.0, 0.0); 
    this.up = new Vec3(0.0, 1.0, 0.0);

    this.rotationMatrix = new Mat4(); 

    this.addComponentsAndGatherUniforms(mesh); // defines this.modelMatrix
  }

  update() {
    this.rotationMatrix.set(). 
          rotate(this.roll).
          rotate(this.pitch, 1, 0, 0).
          rotate(this.yaw, 0, 1, 0);

  	this.modelMatrix.set().
  		scale(this.scale).
  		mul(this.rotationMatrix).
  		translate(this.position);
  }

  move(dt, keysPressed) { 
    this.ahead.set(0, 0, -1).xyz0mul(this.rotationMatrix);
    this.right.set(1, 0,  0).xyz0mul(this.rotationMatrix);
    this.up.   set(0, 1,  0).xyz0mul(this.rotationMatrix);

    if(keysPressed.W) { 
        this.position.addScaled(-this.speed * dt, this.ahead); 
    } 
    if(keysPressed.S) { 
        this.position.addScaled(this.speed * dt, this.ahead); 
    } 
    if(keysPressed.D) { 
        this.position.addScaled(-this.speed * dt, this.right); 
    } 
    if(keysPressed.A) { 
        this.position.addScaled(this.speed * dt, this.right); 
    } 
    if(keysPressed.E) { 
        this.yaw -= 0.02; 
    } 
    if(keysPressed.Q) { 
        this.yaw += 0.02;
    } 
    this.update();
} 
}