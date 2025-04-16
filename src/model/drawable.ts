import { mat4, vec3 } from "gl-matrix";
import { Material } from "./material";
import { TextureFactory } from "./texturefactory";

export abstract class Drawable {
    protected vertices: Float32Array;
    protected triangles: Uint16Array;
    protected normals: Float32Array;
    protected uvs: Float32Array;
    protected material: Material;
    protected xAxis: vec3;
    protected yAxis: vec3;
    protected center: vec3;
    protected translation: vec3;

    constructor(
        diffuse: vec3,
        specular: vec3,
        ambient: vec3,
        n: number,
        alpha: number,
        texturePath: string | undefined
    ) {
        this.material = {
            diffuse,
            specular,
            ambient,
            n,
            texturePath,
            alpha,
        };
        this.vertices = new Float32Array();
        this.triangles = new Uint16Array();
        this.normals = new Float32Array();
        this.uvs = new Float32Array();
        this.xAxis = vec3.fromValues(1, 0, 0);
        this.yAxis = vec3.fromValues(0, 1, 0);
        this.center = vec3.create();
        this.translation = vec3.create();
    }

    getModelMatrix() {
        const zAxis = vec3.create();
        const sumRotation = mat4.create();
        const temp = mat4.create();
        const negativeCenter = vec3.create();
        vec3.normalize(zAxis, vec3.cross(zAxis, this.xAxis, this.yAxis));
        mat4.set(sumRotation,
            this.xAxis[0], this.yAxis[0], zAxis[0], 0,
            this.xAxis[1], this.yAxis[1], zAxis[1], 0,
            this.xAxis[2], this.yAxis[2], zAxis[2], 0,
            0, 0, 0, 1,
        );
        vec3.negate(negativeCenter, this.center);
        mat4.multiply(sumRotation, sumRotation, mat4.fromTranslation(temp, negativeCenter));
        mat4.multiply(sumRotation, mat4.fromTranslation(temp, this.center), sumRotation);
        const modelMatrix = mat4.create();
        mat4.fromTranslation(modelMatrix, this.translation);
        mat4.multiply(modelMatrix, modelMatrix, sumRotation);
        return modelMatrix;
    }
    setTranslation(translation: vec3) {
        this.translation = translation;
    }
    rotate(axis: vec3, angleInRadians: number) {
        const rotationMatrix = mat4.create();
        mat4.fromRotation(rotationMatrix, angleInRadians, axis);
        vec3.transformMat4(this.xAxis, this.xAxis, rotationMatrix);
        vec3.transformMat4(this.yAxis, this.yAxis, rotationMatrix);
    }
    getTranslation(): vec3 {
        return this.translation;
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
    getMaterial(): Material {
        return this.material;
    }
    setMaterial(material: Material): void {
        this.material = material;
    }
}


export class ProcessedDrawable {
    private vertexBuffer: WebGLBuffer;
    private drawable: Drawable;
    private triangleBuffer: WebGLBuffer;
    private normalBuffer: WebGLBuffer;
    private uvBuffer: WebGLBuffer;
    private texture: WebGLTexture | null;

    constructor(
        gl: WebGLRenderingContext,
        drawable: Drawable,
        vertexBuffer: WebGLBuffer,
        triangleBuffer: WebGLBuffer,
        normalBuffer: WebGLBuffer,
        uvBuffer: WebGLBuffer,
        texture: WebGLTexture | null
    ) {
        this.drawable = drawable;
        this.vertexBuffer = vertexBuffer;
        this.triangleBuffer = triangleBuffer;
        this.normalBuffer = normalBuffer;
        this.uvBuffer = uvBuffer;
        this.texture = texture;
    }

    getModelMatrix() {
        return this.drawable.getModelMatrix();
    }
    setTranslation(translation: vec3) {
        this.drawable.setTranslation(translation);
    }
    getTranslation(): vec3 {
        return this.drawable.getTranslation();
    }
    getVertices(): Float32Array {
        return this.drawable.getVertices();
    }
    getTriangles(): Uint16Array {
        return this.drawable.getTriangles();
    }
    getNormals(): Float32Array {
        return this.drawable.getNormals();
    }
    getUVs(): Float32Array {
        return this.drawable.getUVs();
    }
    getMaterial(): Material {
        return this.drawable.getMaterial();
    }

    getVertexBuffer(): WebGLBuffer {
        return this.vertexBuffer;
    }
    getTriangleBuffer(): WebGLBuffer {
        return this.triangleBuffer;
    }
    getNormalBuffer(): WebGLBuffer {
        return this.normalBuffer;
    }
    getUVBuffer(): WebGLBuffer {
        return this.uvBuffer;
    }
    getTexture(): WebGLTexture | null {
        return this.texture;
    }
}

/**
 * Creates a ProcessedDrawable with WebGLBuffers and WebGLTextures from a Drawable.
 * @param gl WebGL context to create buffers and textures
 * @param drawable Drawable to process into a WebGL-ready object
 * @returns Promise resolving to a ProcessedDrawable instance
 */
export async function processDrawable(gl: WebGLRenderingContext, drawable: Drawable): Promise<ProcessedDrawable> {
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawable.getVertices(), gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawable.getNormals(), gl.STATIC_DRAW);

    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawable.getUVs(), gl.STATIC_DRAW);

    const triangleBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawable.getTriangles(), gl.STATIC_DRAW);

    const material = drawable.getMaterial();
    const texture = await TextureFactory.createTexture(gl, material.texturePath);

    return new ProcessedDrawable(gl, drawable, vertexBuffer!, triangleBuffer!, normalBuffer!, uvBuffer!, texture);
}