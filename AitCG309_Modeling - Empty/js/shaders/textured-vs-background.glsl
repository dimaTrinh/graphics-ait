Shader.source[document.currentScript.src.split('js/shaders/')[1]] = `#version 300 es
  in vec4 vertexPosition;
  in vec4 vertexTexCoord;
  out vec4 tex; // passed to FS
  out vec4 modelPosition;
  out vec4 rayDir;

  uniform struct {
  	mat4 modelMatrix;
  } gameObject;

  uniform struct {
    mat4 rayDirMatrix;
  } camera;

  void main(void) {
  	tex = vertexTexCoord;
    modelPosition = vertexPosition;
    rayDir = vertexPosition*camera.rayDirMatrix;
    gl_Position = vec4(vertexPosition.x, vertexPosition.y, 0.99999, vertexPosition.w);
  }
`;