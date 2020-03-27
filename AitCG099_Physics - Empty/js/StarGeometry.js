"use strict";
/* exported StarGeometry */
class StarGeometry {
  constructor(gl) {
    this.gl = gl;

    // allocate and fill vertex buffer in device memory (OpenGL name: array buffer)
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    const vertexPos = new Float32Array(33);
    vertexPos[0] = 0;
    vertexPos[1] = 0;
    vertexPos[2] = 0;
    const angle = Math.PI/5;
    for(let i = 1; i < 11; i++){
      let mult = i+1;
      if (i % 2 === 0){
        vertexPos[3*i] = 0.6*Math.cos(mult*angle);
        vertexPos[3*i+1] = 0.6*Math.sin(mult*angle);
        vertexPos[3*i+2] = 0;
      }
      else{
        vertexPos[3*i] = 0.3*Math.cos(mult*angle);
        vertexPos[3*i+1] = 0.3*Math.sin(mult*angle);
        vertexPos[3*i+2] = 0;
      }
    }
    gl.bufferData(gl.ARRAY_BUFFER, vertexPos, gl.STATIC_DRAW);

    this.vertexBuffer1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer1);
    let colorTemp = [];
    for (let i = 0; i < 33; i++){
      colorTemp.push(Math.random());
    }
    const colorBuffer = new Float32Array(colorTemp);
    gl.bufferData(gl.ARRAY_BUFFER,
      colorBuffer,
      gl.STATIC_DRAW);

    // allocate and fill index buffer in device memory (OpenGL name: element array buffer)
    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    let indexTemp = [];
    for (let i = 1; i < 10; i++){
      indexTemp.push(0, i, i+1);
    }
    indexTemp.push(0,10,1);
    let indexPos = new Uint16Array(indexTemp);

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexPos,
      gl.STATIC_DRAW);
    // create and bind input layout with input buffer bindings (OpenGL name: vertex array)
    this.inputLayout = gl.createVertexArray();
    gl.bindVertexArray(this.inputLayout);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0,
      3, gl.FLOAT, //< three pieces of float
      false, //< do not normalize (make unit length)
      0, //< tightly packed
      0 //< data starts at array start
    );


    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer1);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1,
      3, gl.FLOAT, //< three pieces of float
      false, //< do not normalize (make unit length)
      0, //< tightly packed
      0 //< data starts at array start
    );

    gl.bindVertexArray(null);
  }

  draw() {
    const gl = this.gl;

    gl.bindVertexArray(this.inputLayout);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);  

    gl.drawElements(gl.TRIANGLES, 30, gl.UNSIGNED_SHORT, 0);
  }
}
