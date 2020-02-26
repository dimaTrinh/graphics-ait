Shader.source[document.currentScript.src.split('js/shaders/')[1]] = `#version 300 es
  	in vec4 vertexPosition;
	in vec4 vertexColor; 

	out vec4 color;
	out vec4 worldPosition;

	uniform struct{
		mat4 modelMatrix; 
		float time;
	} gameObject;

  	void main(void) {
    	gl_Position = vertexPosition;
   		color = vertexColor;
   		worldPosition = gl_Position;

   		gl_Position = vertexPosition*gameObject.modelMatrix;
	  	// gl_Position.x += gameObject.position.x + 0.02*cos((gameObject.time - float(gl_VertexID))*4.0);
  		// gl_Position.y += gameObject.position.y + 0.02*sin((gameObject.time - float(gl_VertexID))*4.0);
	}
`;