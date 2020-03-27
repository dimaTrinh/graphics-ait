"use strict";
/* exported DonutGeometry */
class DonutGeometry {
  constructor(gl) {
    this.gl = gl;
    this.numVer = 0;

    // allocate and fill vertex buffer in device memory (OpenGL name: array buffer)
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    let vertexTemp = [];
    for (let phi = 0; phi <= 2*Math.PI; phi+=Math.PI/100){
      vertexTemp.push(0.3*Math.cos(phi), 0.3*Math.sin(phi),0);
      vertexTemp.push(0.5*Math.cos(phi), 0.5*Math.sin(phi),0);
    }
    let vertexPos = new Float32Array(vertexTemp);
    this.numVer = vertexPos.length/3;
    gl.bufferData(gl.ARRAY_BUFFER, vertexPos, gl.STATIC_DRAW);

    this.vertexBuffer1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer1);
    let colorTemp = [];
    for (let i = 0; i < this.numVer; i++){
      colorTemp.push(Math.random(),Math.random(),Math.random());
    }
    const colorBuffer = new Float32Array(colorTemp);
    gl.bufferData(gl.ARRAY_BUFFER,
      colorBuffer,
      gl.STATIC_DRAW);



    // allocate and fill index buffer in device memory (OpenGL name: element array buffer)
    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    let indexTemp = [];
    for (let i = 0; i <= this.numVer-3; i++){
      indexTemp.push(i, i+1, i+2);
    }
    indexTemp.push(this.numVer-2, this.numVer-1, 0);
    indexTemp.push(this.numVer-1, 0, 1);
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

    gl.drawElements(gl.TRIANGLES, this.numVer*3, gl.UNSIGNED_SHORT, 0);
  }
}
