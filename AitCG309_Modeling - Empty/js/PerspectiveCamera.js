"use strict";
/* exported PerspectiveCamera */
class PerspectiveCamera extends UniformProvider {
    constructor(...programs) { 
        super("camera");
        this.position = new Vec3(0, 7.4, 0.6); 
        this.roll = 0;
        this.pitch = 0;
        this.yaw = 180*Math.PI/180;  
               
        this.fov = 1.0; 
        this.aspect = 1.0; 
        this.nearPlane = 0.1; 
        this.farPlane = 1000.0;

        // this.speed = 5; 
        // this.isDragging = false; 
        // this.mouseDelta = new Vec2(0.0, 0.0); 

        // this.ahead = new Vec3(0.0, 0.0, -1.0); 
        // this.right = new Vec3(1.0, 0.0, 0.0); 
        // this.up = new Vec3(0.0, 1.0, 0.0);

        this.rotationMatrix = new Mat4();    
        this.viewProjMatrix = new Mat4(); 
        this.rayDirMatrix = new Mat4();
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

        this.origViewProjMatrix = new Mat4().set(this.rotationMatrix).
              translate(this.position).
              invert();

        this.rayDirMatrix.set().translate(this.position).mul(this.origViewProjMatrix).invert();
    }

    setAspectRatio(ar) { 
        this.aspect = ar; 
        this.update(); 
    } 
} 




