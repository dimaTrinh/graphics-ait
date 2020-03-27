Shader.source[document.currentScript.src.split('js/shaders/')[1]] = `#version 300 es
  	in vec4 vertexPosition;
	in vec4 vertexColor; 

	out vec4 color;
	out vec4 worldPosition;

	uniform struct{
		mat4 modelMatrix;
	} gameObject;

	uniform struct{
		float time;
	} scene;
	
	uniform struct{
		mat4 viewProjMatrix;
	} camera;

  	void main(void) {
    	gl_Position = vertexPosition;
   		color = vertexColor;
   		worldPosition = gl_Position;

   		gl_Position = vertexPosition*gameObject.modelMatrix*camera.viewProjMatrix ;
	  	gl_Position.x += 0.01*sin(scene.time*10.0 + float(gl_VertexID));
  		gl_Position.y += 0.01*sin(scene.time*10.0 + float(gl_VertexID));
	}
`;