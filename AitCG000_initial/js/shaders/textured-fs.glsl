Shader.source[document.currentScript.src.split('js/shaders/')[1]] = `#version 300 es
precision highp float;

out vec4 fragmentColor;
in vec2 texCoord; // pass this on from vertex shader

// we need to bind texture to this
uniform struct{
  sampler2D colorTexture;
} material;

void main(void) {
  fragmentColor = texture(material.colorTexture, texCoord);
}
`;
