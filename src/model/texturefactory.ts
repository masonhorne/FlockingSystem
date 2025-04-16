/**
 * Class containing static functions for selecting texture and loading them into WebGL
 */
export class TextureFactory {

    /**
     * List of available textures for planets
     * these textures were downloaded from https://www.solarsystemscope.com/textures/
     */
    private static availableTextures: string[] = [
        "src/assets/jupiter.jpg",
        "src/assets/mars.jpg",
        "src/assets/moon.jpg",
        "src/assets/neptune.jpg",
        "src/assets/saturn.jpg",
        "src/assets/uranus.jpg",
        "src/assets/venus.jpg",
    ];

    /**
     * Helper for randomly assigning a planet a texture
     * @returns A random texture path from the available textures
     */
    static getRandomTexture() {
        const randomIndex = Math.floor(Math.random() * this.availableTextures.length);
        return this.availableTextures[randomIndex];
    }

    /**
     * Create a texture from the given path
     * @param gl WebGLRenderContext for creating the texture
     * @param texturePath Path to the texture to load
     * @returns A promise that resolves to the WebGLTexture object or null if no texturePath is given
     */
    static async createTexture(gl: WebGLRenderingContext, texturePath?: string): Promise<WebGLTexture | null> {
        if (!texturePath) {
            return Promise.resolve(null);
        }

        const currTexture = gl.createTexture();
        if (!currTexture) {
            throw new Error("Failed to create texture");
        }
        
        gl.bindTexture(gl.TEXTURE_2D, currTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([64, 64, 64, 255]));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);

        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
                gl.bindTexture(gl.TEXTURE_2D, currTexture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.bindTexture(gl.TEXTURE_2D, null);
                resolve(currTexture);
            };
            image.onerror = () => {
                console.error("Unable to load texture " + texturePath);
                reject("Unable to load texture " + texturePath);
            };
            image.crossOrigin = "Anonymous";
            image.src = texturePath;
        });
    }
}