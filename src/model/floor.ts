import { vec3 } from 'gl-matrix';
import { Drawable } from './drawable';

export class Floor extends Drawable {

  /**
   * Creates a floor drawable object
   * @param position Point in space for corner of floor
   * @param size Distance to extend floor from position in both dimensions
   * @param diffuse 0-1 diffuse color rgb values for the floor
   * @param specular 0-1 specular color rgb values for the floor
   * @param ambient 0-1 ambient color rgb values for the floor
   * @param n  Phong shading exponent
   * @param texturePath Texture path to apply to the floor
   */
  constructor(
    position: vec3,
    size: number,
    diffuse: vec3,
    specular: vec3,
    ambient: vec3,
    n: number,
    alpha: number,
    texturePath: string | undefined
  ) {
    super(diffuse, specular, ambient, n, alpha, texturePath);
    this.generateSquare(position, size);
  }

  private generateSquare(position: vec3, size: number) {
    this.vertices = new Float32Array([
      position[0], position[1], position[2],
      position[0] + size, position[1], position[2],
      position[0] + size, position[1], position[2] + size,
      position[0], position[1], position[2] + size,
    ])
    this.triangles = new Uint16Array([
        0, 1, 2,
        0, 2, 3,
    ]);
    this.normals = new Float32Array([
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,
    ]);
    this.uvs = new Float32Array([
      0, 0,
      1, 0,
      1, 1,
      0, 1,
    ]);
    for(let i = 0; i < this.vertices.length; i += 3) {
      this.center[0] += this.vertices[i];
      this.center[1] += this.vertices[i + 1];
      this.center[2] += this.vertices[i + 2];
    }
    this.center[0] /= this.vertices.length / 3;
    this.center[1] /= this.vertices.length / 3;
    this.center[2] /= this.vertices.length / 3;
  }
}

