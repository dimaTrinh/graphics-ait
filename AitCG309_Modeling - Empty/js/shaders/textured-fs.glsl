Shader.source[document.currentScript.src.split('js/shaders/')[1]] = `#version 300 es 
  precision highp float;

  out vec4 fragmentColor;
  in vec4 color;
  in vec4 tex;
  in vec4 worldNormal;
  in vec4 modelPosition;
  in vec4 worldPosition;

  uniform struct{
  	sampler2D colorTexture;
    vec3 specularColor;
    float shininess;
  } material;

  uniform struct {
    float time;
  } scene;

  uniform struct{
    mat4 viewProjMatrix;
    vec3 worldPosition;
  } camera;

  uniform struct {
    vec4 position;
    vec3 powerDensity;
  } lights[8];

  vec3 shade(vec3 normal, vec3 lightDir, vec3 viewDir, 
    vec3 powerDensity, vec3 materialColor, vec3 specularColor, float shininess) {

    float cosa = clamp(dot(lightDir, normal), 0.0, 1.0);
    float cosb = clamp(dot(viewDir, normal), 0.0, 1.0);

    vec3 halfway = normalize(viewDir + lightDir);
    float cosDelta = clamp(dot(halfway, normal), 0.0, 1.0);

    return powerDensity * materialColor * cosa 
      + powerDensity * specularColor * pow(cosDelta, shininess)
       * cosa / max(cosb, cosa);
  }

  void main(void) {
    for (int i = 0; i <= 2; i++){
      vec3 tempLight = vec3(lights[i].position.x, lights[i].position.y, lights[i].position.z);
      if (i == 2){
        tempLight = vec3(lights[i].position.x + cos(scene.time), lights[i].position.y, lights[i].position.z + sin(scene.time));
      }
      vec3 lightDiff = tempLight.xyz - worldPosition.xyz/worldPosition.w * lights[i].position.w;
      vec3 lightDir = normalize(lightDiff);
      vec3 viewDir = normalize(camera.worldPosition.xyz - worldPosition.xyz);
      float distanceSquared = dot(lightDiff, lightDiff);
      vec3 powerDensity = lights[i].powerDensity/distanceSquared;

      vec3 normal = normalize(worldNormal.xyz);// + noiseGrad(worldPosition.xyz*10.0)*10.0); //interpolation would ruin the noramalization, so this step is done here
      fragmentColor.rgb += shade(normal, lightDir, viewDir, powerDensity, texture(material.colorTexture, tex.xy/tex.w).rgb, material.specularColor, material.shininess);
      //fragmentColor = vec4(abs(normal),1);
    }
  }
`;