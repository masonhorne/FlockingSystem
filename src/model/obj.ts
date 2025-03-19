import { vec3 } from 'gl-matrix';
import { Drawable } from './drawable';
import { ObjModelParams } from './objprocessor';

export class Obj extends Drawable {
    constructor(
        objData: ObjModelParams,
        size: number,
        position: vec3,
        diffuse: vec3,
        specular: vec3,
        ambient: vec3,
        n: number,
        alpha: number,
        texturePath: string | undefined,
    ) {
        super(diffuse, specular, ambient, n, alpha, texturePath);
        this.generateModel(objData, size, position);
    }

    private generateModel(objParams: ObjModelParams, size: number, position: vec3) {
        const { vertices, normals, uvs, triangles, center, bounds } = objParams;
        const min = bounds.min;
        const max = bounds.max;
        const modelWidth = max[0] - min[0];
        const modelHeight = max[1] - min[1];
        const modelDepth = max[2] - min[2];
        const modelMaxSize = Math.max(modelWidth, modelHeight, modelDepth);
        const scaleFactor = size / modelMaxSize;
        const centerOffset = vec3.create();
        vec3.scale(centerOffset, center, scaleFactor);
        vec3.sub(centerOffset, position, centerOffset);
        const transformedVertices = new Float32Array(vertices.length);
        for (let i = 0; i < vertices.length; i += 3) {
            transformedVertices[i] = vertices[i] * scaleFactor + centerOffset[0];
            transformedVertices[i + 1] = vertices[i + 1] * scaleFactor + centerOffset[1];
            transformedVertices[i + 2] = vertices[i + 2] * scaleFactor + centerOffset[2];
        }
        const transformedCenter = vec3.create();
        vec3.scale(transformedCenter, center, scaleFactor);
        vec3.add(transformedCenter, transformedCenter, centerOffset);
        this.vertices = transformedVertices;
        this.normals = normals;
        this.uvs = uvs;
        this.triangles = triangles;
        this.center = transformedCenter;
    }          
}
