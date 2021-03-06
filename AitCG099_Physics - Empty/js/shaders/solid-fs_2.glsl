Shader.source[document.currentScript.src.split('js/shaders/')[1]] = `#version 300 es 
  precision highp float;

  in vec4 color; 
  in vec4 worldPosition; 

  out vec4 fragmentColor;

  uniform struct{
    vec3 stripeColor1;
    vec3 stripeColor2;
    float stripeWidth;
  } material;

  uniform struct {
    float time;
  } scene;


  //Adjusts the width of the stripe according to Time -> helps make the hypno effect
  float estimateWidth(float currentTime){
    if (fract(currentTime) < 0.5){
      return fract(currentTime)*0.5;
    }
    else{
      return (1.0-fract(currentTime))*0.5;
    }
  }

  //Helps decide which color to use for the stripe according to the position of the object
  bool estimateColor(vec4 position){
    if (fract((position.x/estimateWidth(scene.time)-position.y/estimateWidth(scene.time))*5.0) < 0.5){
      return true;
    } 
    else
      return false;
  }

  void main(void) {
    if (estimateColor(worldPosition)){
      fragmentColor.xyz = material.stripeColor1;
    }
    else{
      fragmentColor.xyz = material.stripeColor2;
    }

  fragmentColor.w = 1.0;
  }
`;