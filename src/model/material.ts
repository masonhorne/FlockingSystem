import { vec3 } from "gl-matrix";

export interface Material {
    diffuse: vec3;
    specular: vec3;
    ambient: vec3;
    n: number;
    alpha: number;
    texturePath: string | undefined;
}