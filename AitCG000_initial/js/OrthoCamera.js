"use strict";
/* exported OrthoCamera */
class OrthoCamera extends UniformProvider {
  constructor(...programs) { 
    super("camera");
    this.position = new Vec2(0.25, 0); 
    this.rotation = 0.3; 
    this.windowSize = new Vec2(2, 2); 
    this.scale = 1.3;
    
    this.addComponentsAndGatherUniforms(...programs);
	}

	update () { 
	    this.viewProjMatrix.set(). 
	      scale(this.scale). 
	      scale(this.windowSize). 
	      rotate(this.rotation). 
	      translate(this.position). 
	      invert(); 
 	}

	setAspectRatio(ar) { 
	    this.windowSize.x = this.windowSize.y * ar;
	    this.update();
	} 
}


