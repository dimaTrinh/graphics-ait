Shader.source[document.currentScript.src.split('js/shaders/')[1]] = `#version 300 es 
  precision highp float;

  out vec4 fragmentColor;
  in vec4 color;
  in vec4 tex;
  in vec4 worldNormal;
  in vec4 modelPosition;
  in vec4 worldPosition;

  uniform struct{
    samplerCube envmapTexture; 
  } material;

  uniform struct{
    mat4 viewProjMatrix;
    vec3 worldPosition;
  } camera;

  void main(void) {
    vec3 normal = normalize(worldNormal.xyz); //interpolation would ruin the noramalization, so this step is done here
    // compute vector from surface point to camera
    vec3 viewDir = normalize(camera.worldPosition.xyz - worldPosition.xyz);
    fragmentColor = texture(material.envmapTexture, reflect(-viewDir, normal));
;
  }
`;