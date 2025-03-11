import { vec3 } from 'gl-matrix';
import { Drawable } from './drawable';
import { Material } from './material';

export class Floor implements Drawable {
  private vertices: Float32Array;
  private triangles: Uint16Array;
  private normals: Float32Array;
  private uvs: Float32Array;
  private material: Material;

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

    this.material = {
      diffuse,
      specular,
      ambient,
      n,
      texturePath,
      alpha,
    };
  }

  getVertices(): Float32Array {
    return this.vertices;
  }

  getTriangles(): Uint16Array {
    return this.triangles;
  }

  getNormals(): Float32Array {
    return this.normals;
  }

  getUVs(): Float32Array {
    return this.uvs;
  }

  getMaterial() {
    return this.material;
  }
}

