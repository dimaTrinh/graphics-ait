Shader.source[document.currentScript.src.split('js/shaders/')[1]] = `#version 300 es 
  precision highp float;

  out vec4 fragmentColor;
  in vec4 color;
  in vec4 tex;
  in vec4 worldNormal;
  in vec4 modelPosition;
  in vec4 worldPosition;

  uniform struct{
  	vec4 solidColor;
  	sampler2D colorTexture;
  } material;

  uniform struct {
    float time;
  } scene;

  uniform struct {
    vec4 position;
    vec3 powerDensity;
  } lights[8];

  vec3 shade(vec3 normal, vec3 lightDir, vec3 powerDensity, vec3 materialColor) {
    float cosa = clamp( dot(lightDir, normal),0.0,1.0);
    return powerDensity * materialColor * cosa;
  }

  void main(void) {
    for (int i = 0; i <= 2; i++){
      vec3 tempLight = vec3(lights[i].position.x, lights[i].position.y, lights[i].position.z);
      if (i == 2){
        tempLight = vec3(lights[i].position.x + cos(scene.time), lights[i].position.y, lights[i].position.z + sin(scene.time));
      }
      vec3 lightDiff = tempLight.xyz - worldPosition.xyz/worldPosition.w * lights[i].position.w;
      vec3 lightDir = normalize(lightDiff);
      float distanceSquared = dot(lightDiff, lightDiff);
      vec3 powerDensity = lights[i].powerDensity/distanceSquared;

      vec3 normal = normalize(worldNormal.xyz); //interpolation would ruin the noramalization, so this step is done here
      //fragmentColor.rgb += shade(normal, lightDir, powerDensity, texture(material.colorTexture, tex.xy/tex.w).rgb);
      fragmentColor = vec4(abs(normal),1);
    }
  }
`;