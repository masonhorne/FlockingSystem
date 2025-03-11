import { vec3 } from "gl-matrix";

export interface Light {
    position: vec3;
    diffuse: vec3;
    specular: vec3;
    ambient: vec3;
}