"use strict";
/* exported HeartGeometry */
class HeartGeometry {
  constructor(gl) {
    this.gl = gl;
    this.numVer = 0;

    // allocate and fill vertex buffer in device memory (OpenGL name: array buffer)
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    let vertexTemp = [];
    vertexTemp.push(0,0,0);
    for (let phi = 0; phi <= 2*Math.PI; phi+=Math.PI/50){
      vertexTemp.push(0.5*(0.16*Math.pow(Math.sin(phi),3)), 0.5*(0.13*Math.cos(phi)-0.05*Math.cos(2*phi)-0.02*Math.cos(3*phi)-0.01*Math.cos(4*phi)),0);
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
    for (let i = 0; i <= this.numVer-2; i++){
      indexTemp.push(0, i+1, i+2);
    }
    indexTemp.push(0,this.numVer-1,1);
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
