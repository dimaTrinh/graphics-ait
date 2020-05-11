class ClippedQuadric extends UniformProvider {
  constructor(id, ...programs) {
    super(`clippedQuadrics[${id}]`);
    this.addComponentsAndGatherUniforms(...programs);
  }
  makeUnitCylinder(){
    this.surface.set(1,  0,  0,  0,
                     0,  0,  0,  0,
                     0,  0,  1,  0,
                     0,  0,  0, -1);
    this.clipper.set(0,  0,  0,  0,
                     0,  1,  0,  0,
                     0,  0,  0,  0,
                     0,  0,  0, -1);
  }
  makeUnitSphere(){
    this.surface.set(1,  0,  0,  0,
                     0,  1,  0,  0,
                     0,  0,  1,  0,
                     0,  0,  0,  -1);
    this.clipper.set(0,  0,  0,  0,
                     0,  0,  0,  0,
                     0,  0,  0,  0,
                     0,  0,  0, 0);
  }
  makeUnitCone(){
    this.surface.set(1,  0,  0,  0,
                     0,  -1,  0,  0,
                     0,  0,  1,  0,
                     0,  0,  0,  0);
    this.clipper.set(0,  0,  0,  0,
                     0,  1,  0,  0,
                     0,  0,  0,  0,
                     0,  0,  0,  -1);
  }
  makePawn(){
    this.surface.set(1,  0,  0,  0,
                     0,  -1,  0,  0,
                     0,  0,  1,  0,
                     0,  0,  0,  0);
    this.clipper.set(1,  0,  0,  0,
                     0,  1,  0,  0,
                     0,  0,  1,  0,
                     0,  0,  0,  -1);
  }
  makeChessBody(){
    this.surface.set(1,  0,  0,  0,
                     0,  -1,  0,  0,
                     0,  0,  1,  0,
                     0,  0,  0,  -1);
    this.clipper.set(0,  0,  0,  0,
                     0,  1,  0,  0,
                     0,  0,  0,  0,
                     0,  0,  0,  -1);
  }
  makeCrown(){
    this.surface.set(1,  0,  0,  0,
                     0,  0,  0,  0,
                     0,  0,  1,  0,
                     0,  -1,  0,  0);
    this.clipper.set(0,  0,  0,  0,
                     0,  1,  0,  0,
                     0,  0,  0,  0,
                     0,  0,  0,  -1);
  }
  makeBishopHead(){
    this.surface.set(1,  0,  0,  0,
                     0,  1,  0,  0,
                     0,  0,  1,  0,
                     0,  0,  0,  -1);
    this.clipper.set(1,  0,  0,  0,
                     0,  1,  0,  0,
                     0,  0,  0,  0,
                     0,  0,  0, -0.25);
  }
  transform(T){
    const invT = new Mat4(T).invert();
    const transT = new Mat4(T).invert().transpose();
    this.surface = this.surface.premul(invT).mul(transT);
    this.clipper = this.clipper.premul(invT).mul(transT);
  }
  transformClipper(T){
    const invT = new Mat4(T).invert();
    const transT = new Mat4(T).invert().transpose();
    this.clipper = this.clipper.premul(invT).mul(transT);
  }
  transformSurface(T){
    const invT = new Mat4(T).invert();
    const transT = new Mat4(T).invert().transpose();
    this.surface = this.surface.premul(invT).mul(transT);
  }
}
