Shader.source[document.currentScript.src.split('js/shaders/')[1]] = `#version 300 es 
  precision highp float;

  out vec4 fragmentColor;
  in vec4 color;
  in vec4 tex;
  in vec4 normal;

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
    for (int i = 0; i < lights.length(); i++){
      vec3 lightDir = lights[i].position.xyz;
      vec3 powerDensity = lights[i].powerDensity;

      fragmentColor.rgb += shade(normal.xyz, lightDir, powerDensity, texture(material.colorTexture, tex.xy/tex.w).rgb);
    }
  }
`;