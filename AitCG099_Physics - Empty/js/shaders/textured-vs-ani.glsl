Shader.source[document.currentScript.src.split('js/shaders/')[1]] = `#version 300 es
  in vec4 vertexPosition;
  in vec4 vertexTexCoord;
  out vec4 texCoord; // passed to FS
  out vec4 modelPosition;

  uniform struct {
    mat4 modelMatrix;
    vec2 offset;
  } gameObject;

  uniform struct {
    mat4 viewProjMatrix;
  } camera;

  void main(void) {
    //offset x by 0.167, offset y by 0.18
    texCoord = vec4(vertexTexCoord.x/5.8+0.167*float(gameObject.offset.x), vertexTexCoord.y/5.8+0.164*float(gameObject.offset.y), vertexTexCoord.z, vertexTexCoord.w);
    modelPosition = vertexPosition;
    gl_Position = vertexPosition * gameObject.modelMatrix * camera.viewProjMatrix;
  }
`;