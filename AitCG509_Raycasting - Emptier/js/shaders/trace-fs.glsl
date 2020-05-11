Shader.source[document.currentScript.src.split('js/shaders/')[1]] = `#version 300 es 
  precision highp float;

  out vec4 fragmentColor;
  in vec4 rayDir;

  uniform struct {
  	samplerCube envTexture;
    vec3 lightWoodColor;
    vec3 darkWoodColor;
    float freq;
    float noiseFreq;
    float noiseExp;
    float noiseAmp;
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

  float intersectQuadricOutside(mat4 A, mat4 B, vec4 e, vec4 d){
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
      if (dot(hit1*B, hit1) < 0.0)
        t1 = -1.0;

      vec4 hit2 = e + d*t2;
      if (dot(hit2*B, hit2) < 0.0)
        t2 = -1.0; 

      return (t1<0.0)?t2:((t2<0.0)?t1:min(t1, t2));
    }
  }

  bool findBestHit(vec4 e, vec4 d, out float bestT, out int bestIndex){
    bestT = 9000.1;
    for (int i = 0; i < 9; i++){
      float t = intersectQuadric(clippedQuadrics[i].surface, 
          clippedQuadrics[i].clipper, e, d);
      if (i == 7){ //bishop head
        t = intersectQuadricOutside(clippedQuadrics[i].surface, 
        clippedQuadrics[i].clipper, e, d);
      }
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
      clamp(dot(lightDir, normal),0.0,1.0);
    return
      powerDensity * materialColor * cosa;
  }

  float snoise(vec3 r) {
    vec3 s = vec3(7502, 22777, 4767);
    float f = 0.0;
    for(int i=0; i<16; i++) {
      f += sin( dot(s - vec3(32768, 32768, 32768), r)
                                   / 65536.0);
      s = mod(s, 32768.0) * 2.0 + floor(s / 32768.0);
    }
    return f / 32.0 + 0.5;
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

      for (int i = 0; i < 2; i++){    
        vec3 lightDiff = lights[i].position.xyz - hit.xyz * lights[i].position.w;
        vec3 lightDir = normalize(lightDiff);
        float distanceSquared = dot(lightDiff, lightDiff);
        vec3 powerDensity = lights[i].powerDensity/distanceSquared;

        // Shadow stuff 
        vec4 shadowOrigin = hit + 0.01 * vec4(normal, 0);
        vec4 shadowDirection = vec4(lightDir, 0);

        float bestShadowT;
        int bestShadowIndex;
        bool shadowRayHitSomething = findBestHit(shadowOrigin, shadowDirection, 
          bestShadowT, bestShadowIndex);

        if(!shadowRayHitSomething || 
          bestShadowT * lights[i].position.w > sqrt(dot(lightDiff, lightDiff)) ) {
          // add light source contribution
          if (index == 4 || index == 5){ //shading by its normal
            fragmentColor.rgb += shade(normal, lightDir, powerDensity, normal);
          }
          else{ //Procedural wood coloring
            float w = fract(hit.x * material.freq + 
              pow(snoise(hit.xyz * material.noiseFreq),material.noiseExp)* material.noiseAmp);

            vec3 color = mix(material.lightWoodColor, 
              material.darkWoodColor, w);
            fragmentColor.rgb += shade(normal, lightDir, powerDensity, color);
          }
        }
      }
    }
    
  }

`;