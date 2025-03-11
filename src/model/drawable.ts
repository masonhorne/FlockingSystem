import { Material } from "./material";
import { TextureFactory } from "./texturefactory";

export interface Drawable {
  getVertices(): Float32Array;
  getTriangles(): Uint16Array;
  getNormals(): Float32Array;
  getUVs(): Float32Array;
  getMaterial(): Material;
}

export interface ProcessedDrawable extends Drawable {
    getVertexBuffer(): WebGLBuffer;
    getTriangleBuffer(): WebGLBuffer;
    getNormalBuffer(): WebGLBuffer;
    getUVBuffer(): WebGLBuffer;
    getTexture(): WebGLTexture | null;
}

/**
 * Creates a ProcessedDrawable with WebGLBuffers and WebGLTextures from a Drawable
 * @param gl GL context to create the buffers and textures
 * @param drawable Drawable to process buffers and textures from
 * @returns Promise that resolves to a ProcessedDrawable
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
    return {
        getVertices: () => drawable.getVertices(),
        getTriangles: () => drawable.getTriangles(),
        getNormals: () => drawable.getNormals(),
        getUVs: () => drawable.getUVs(),
        getMaterial: () => drawable.getMaterial(),
        getVertexBuffer: () => vertexBuffer,
        getTriangleBuffer: () => triangleBuffer,
        getNormalBuffer: () => normalBuffer,
        getUVBuffer: () => uvBuffer,
        getTexture: () => texture,
    };
}