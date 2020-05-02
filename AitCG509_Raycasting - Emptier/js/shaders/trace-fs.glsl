Shader.source[document.currentScript.src.split('js/shaders/')[1]] = `#version 300 es 
  precision highp float;

  out vec4 fragmentColor;
  in vec4 rayDir;

  uniform struct {
  	samplerCube envTexture;
  } material;

  uniform struct {
    mat4 viewProjMatrix;  
    mat4 rayDirMatrix;
    vec3 position;
  } camera;

  float intersectQuadric(mat4 A, vec4 e, vec4 d){
    float a = dot(d*A, d);
    float b = dot(d*A, e) + dot(e*A, d);
    float c = dot(e*A, e);
    float disc = b*b-4.0*a*c;
    if (disc < 0.0){
      return -1.0;
    }
    else{
      float t1 = (-1.0*b - sqrt(disc))/(2.0*a);
      float t2 = (-1.0*b + sqrt(disc))/(2.0*a);
      return (t1<0.0)?t2:((t2<0.0)?t1:min(t1, t2));
    }
  }

  void main(void) {
	  vec4 e = vec4(camera.position, 1);		 //< ray origin
  	vec4 d = vec4(normalize(rayDir).xyz, 0); //< ray direction

    mat4 A = mat4(1, 0, 0, 0,
                  0, 4, 0, 0,
                  0, 0, 0.5, 0,
                  0, 0, 0, -9);

    float t = intersectQuadric(A, e, d);

    if (t < 0.0){
      // nothing hit by ray, return enviroment color
      fragmentColor = texture(material.envTexture, d.xyz );
    }
    else{
      vec4 hit = e + d * t;
      vec3 normal = normalize((hit * A + A * hit).xyz);
      fragmentColor.rgb = normal;
    }
    
  }

`;