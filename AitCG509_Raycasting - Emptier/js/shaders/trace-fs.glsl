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

  uniform struct{
    mat4 surface;
    mat4 clipper;
  } clippedQuadrics[16];

  uniform struct {
    vec4 position;
    vec3 powerDensity;
  } lights[8];

  float intersectQuadric(mat4 A, mat4 B, vec4 e, vec4 d){
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

      vec4 hit1 = e + d*t1;
      if (dot(hit1*B, hit1) > 0.0)
        t1 = -1.0;

      vec4 hit2 = e + d*t2;
      if (dot(hit2*B, hit2) > 0.0)
        t2 = -1.0; 

      return (t1<0.0)?t2:((t2<0.0)?t1:min(t1, t2));
    }
  }

  bool findBestHit(vec4 e, vec4 d, out float bestT, out int bestIndex){
    bestT = 9000.1;
    for (int i = 0; i < 4; i++){
      float t = intersectQuadric(clippedQuadrics[i].surface, 
        clippedQuadrics[i].clipper, e, d);
      if (t > 0.0 && t < bestT){
        bestT = t;
        bestIndex = i;
      }
    }
    if (bestT > 9000.0)
      return false;
    return true;
  }

  vec3 shade(vec3 normal, vec3 lightDir, vec3 powerDensity, vec3 materialColor) {
    float cosa =
      clamp( dot(lightDir, normal),0.0,1.0);
    return
      powerDensity * materialColor * cosa;
  }

  void main(void) {
	  vec4 e = vec4(camera.position, 1);		 //< ray origin
  	vec4 d = vec4(normalize(rayDir).xyz, 0); //< ray direction

    float t;
    int index;

    bool hitFound = findBestHit(e, d, t, index);

    if (!hitFound){
      // nothing hit by ray, return enviroment color
      fragmentColor = texture(material.envTexture, d.xyz );
    }
    else{
      vec4 hit = e + d * t;
      vec3 normal = normalize((hit * clippedQuadrics[index].surface + 
        clippedQuadrics[index].surface * hit).xyz);
      if (dot(normal, d.xyz) > 0.0){
        normal = -normal;
      }

      for (int i = 0; i < 1; i++){
        //Shadow stuff
        vec4 shadowOrigin = hit + 0.01 * vec4(normal, 1);
        vec4 shadowDirection = vec4(lights[i].position.xyz, 0);
        float bestShadowT;
        int bestShadowIndex;
        bool shadowRayHitSomething = findBestHit(shadowOrigin, shadowDirection, 
          bestShadowT, bestShadowIndex);

        vec3 lightDir = lights[i].position.xyz;
        vec3 powerDensity = lights[i].powerDensity;
        vec4 lightDiff = vec4(lights[i].position.xyz,1) - hit;

        if(!shadowRayHitSomething || 
          bestShadowT * lights[i].position.w > sqrt(dot(lightDiff, lightDiff)) ) {
          // add light source contribution
          fragmentColor.rgb += shade(normal, lightDir, powerDensity, normal);
        }
      }
    }
    
  }

`;