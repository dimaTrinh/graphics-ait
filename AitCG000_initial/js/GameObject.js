"use strict"; 
/* exported GameObject */
class GameObject extends UniformProvider {
  constructor(mesh) { 
    super("gameObject");
 
    this.position = new Vec3(0, 0, 0); 
    this.orientation = 0; 
    this.scale = new Vec3(1, 1, 1); 
    this.radius = 0.2;
    this.parent = null;
    
    this.addComponentsAndGatherUniforms(mesh);
  } 

  update(){
    if (!this.parent){
    	this.modelMatrix = new Mat4();
    	this.modelMatrix.set();
    	this.modelMatrix.scale(this.scale);
    	this.modelMatrix.rotate(this.orientation);
    	this.modelMatrix.translate(this.position);
    }
    else{
      this.modelMatrix = new Mat4();
      this.modelMatrix.set();
      this.modelMatrix.scale(this.scale);
      this.modelMatrix.rotate(this.orientation);
      this.modelMatrix.translate(this.position);
      this.parent.update();
      this.modelMatrix.mul(this.parent.modelMatrix);
    }
  }
}
