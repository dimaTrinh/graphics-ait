"use strict";
/* exported PerspectiveCamera */
class PerspectiveCamera extends UniformProvider {
    constructor(...programs) { 
        super("camera");
        this.position = new Vec3(0, 8.0, 25.0);
        this.worldPosition = new Vec3(); 
        this.roll = 0;
        this.pitch = 0*Math.PI/180;
        this.yaw = 0*Math.PI/180;  
               
        this.fov = 1.0; 
        this.aspect = 1.0; 
        this.nearPlane = 0.1; 
        this.farPlane = 1000.0;

        this.rotationMatrix = new Mat4();    
        this.viewProjMatrix = new Mat4(); 
        this.rayDirMatrix = new Mat4();
        this.origViewProjMatrix = new Mat4();
        this.update();

        this.addComponentsAndGatherUniforms(...programs);
    }

    update() { 
        this.rotationMatrix.set(). 
          rotate(this.roll).
          rotate(this.pitch, 1, 0, 0).
          rotate(this.yaw, 0, 1, 0);
        
        if (this.parent){
            this.parent.update();

            this.viewProjMatrix.
              set(this.rotationMatrix).
              translate(this.position).
              mul(this.parent.modelMatrix).
              invert();
        }else{
            this.viewProjMatrix.
              set(this.rotationMatrix).
              translate(this.position).
              invert();
        }

        const yScale = 1.0 / Math.tan(this.fov * 0.5); 
        const xScale = yScale / this.aspect; 
        const f = this.farPlane; 
        const n = this.nearPlane; 
        this.viewProjMatrix.mul( new Mat4( 
            xScale ,    0    ,      0       ,   0, 
            0    ,  yScale ,      0       ,   0, 
            0    ,    0    ,  (n+f)/(n-f) ,  -1, 
            0    ,    0    ,  2*n*f/(n-f) ,   0)); 

        this.worldPosition.set(this.position);        
        if (this.parent){
            this.parent.update();
            this.worldPosition.xyz1mul(this.parent.modelMatrix);
        }

        this.rayDirMatrix.set().translate(this.worldPosition).mul(this.viewProjMatrix).invert();
    }

    setAspectRatio(ar) { 
        this.aspect = ar; 
        this.update(); 
    } 
} 




