import { mat4 } from "gl-matrix";
import { Camera } from "./camera";
import { Drawable, processDrawable, ProcessedDrawable } from "./model/drawable";
import { Light } from "./model/light";

export class Scene {
    private gl: WebGLRenderingContext;
    private objects: ProcessedDrawable[] = [];
    private lights: Light[] = [];
    private camera: Camera;
    private aPositionLoc: GLint | undefined;
    private aNormalLoc: GLint | undefined;
    private aUVLoc: GLint | undefined;
    private uModelMatrixLoc:  WebGLUniformLocation | null | undefined;
    private uProjectionViewMatrixLoc:  WebGLUniformLocation | null | undefined;
    private uCameraPositionLoc:  WebGLUniformLocation | null | undefined;
    private uAmbientLoc:  WebGLUniformLocation | null | undefined;
    private uDiffuseLoc:  WebGLUniformLocation | null | undefined;
    private uSpecularLoc:  WebGLUniformLocation | null | undefined;
    private uShininessLoc:  WebGLUniformLocation | null | undefined;
    private uAlphaLoc:  WebGLUniformLocation | null | undefined;
    private uUsingTextureLoc:  WebGLUniformLocation | null | undefined;
    private uTextureLoc:  WebGLUniformLocation | null | undefined;

    private animationFrameId: number | undefined;
  
    constructor(canvas: HTMLCanvasElement, camera: Camera) {
      this.camera = camera;
      this.gl = canvas.getContext("webgl")!;
      if (!this.gl) {
        console.error("WebGL not supported!");
        return;
      }
      this.gl.viewport(0, 0, canvas.width, canvas.height);
      this.gl.clearColor(0, 0, 0, 1.0);
      this.gl.clearDepth(1.0);
      this.gl.enable(this.gl.DEPTH_TEST);
      this.gl.enable(this.gl.BLEND);
      this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
      this.setupShaders();
      this.renderObjects();
    }

    public async addObject(object: Drawable): Promise<void> {
        const processedObject = await processDrawable(this.gl, object);
        this.objects.push(processedObject);
    }

    public addLight(light: Light) {
        this.lights.push(light);
        if(this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.setupShaders();
        this.renderObjects();
    }

    public removeLight(light: Light) {
        const index = this.lights.findIndex(l => l === light);
        if (index > -1) {
            this.lights.splice(index, 1);
            if(this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
            }
            this.setupShaders();
            this.renderObjects();
        }
    }

    public removeObject(object: Drawable): void {
        // Remove objects based on matching vertices
        const index = this.objects.findIndex(o => 
            object.getVertices().length == o.getVertices().length &&
            object.getVertices().every((v, i) => v == o.getVertices()[i])
        );
        if (index > -1) {
            this.objects.splice(index, 1);
        }
    }
  
    private setupShaders(): void {
      const vertexShaderSource = `
        attribute vec3 aPosition;
        attribute vec3 aNormal;
        attribute vec2 aUV;
        uniform mat4 uModelMatrix;
        uniform mat4 uProjectionViewMatrix;

        varying vec3  vPosition;
        varying vec2 vUV;
        varying vec3 vNormal;
        
        void main() {
            vec4 vPosition4 = uModelMatrix * vec4(aPosition, 1.0);
            vPosition = vPosition4.xyz;
            gl_Position = uProjectionViewMatrix * vPosition4;

            vec4 vNormal4 = uModelMatrix * vec4(aNormal, 0.0);
            vNormal = normalize(vec3(vNormal4.x, vNormal4.y, vNormal4.z));

            vUV = aUV;
        }
      `;
      const lightCount = Math.max(this.lights.length, 1);
      const fragmentShaderSource = `
        precision mediump float;

        uniform vec3 uLightPosition[${lightCount}];
        uniform vec3 uLightAmbient[${lightCount}];
        uniform vec3 uLightDiffuse[${lightCount}];
        uniform vec3 uLightSpecular[${lightCount}];

        uniform vec3 uCameraPosition;

        uniform vec3 uAmbient;
        uniform vec3 uDiffuse;
        uniform vec3 uSpecular;
        uniform float uShininess;
        uniform float uAlpha;

        uniform bool uUsingTexture;
        uniform sampler2D uTexture;

        varying vec2 vUV;
        varying vec3 vPosition;
        varying vec3 vNormal;

        void main(void) {
            vec3 normal = normalize(vNormal);
            vec3 ambient = vec3(0, 0, 0);
            vec3 diffuse = vec3(0, 0, 0);
            vec3 specular = vec3(0, 0, 0);

            for(int i = 0; i < ${lightCount}; i++) {
                vec3 lightDirection = normalize(uLightPosition[i] - vPosition);
                float lambertian = max(dot(lightDirection, normal), 0.0);
                vec3 viewDirection = normalize(uCameraPosition - vPosition);
                vec3 halfVector = normalize(lightDirection + viewDirection);
                float highlight = pow(max(dot(normal, halfVector), 0.0), uShininess);
                ambient += uLightAmbient[i] * uAmbient;
                diffuse += uLightDiffuse[i] * uDiffuse * lambertian;
                specular += uLightSpecular[i] * uSpecular * highlight;
            }

            ambient /= float(${lightCount});
            diffuse /= float(${lightCount});
            specular /= float(${lightCount});

            vec3 lightColor = ambient + diffuse + specular;

            if(!uUsingTexture) {
                gl_FragColor = vec4(lightColor, uAlpha);
            } else {
                vec4 textureColor = texture2D(uTexture, vUV);
                gl_FragColor = vec4(textureColor.rgb * lightColor, textureColor.a);
            }
        }
      `;
  

        const fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        if(!fragmentShader) {
            console.error("Error creating fragment shader");
            return;
        }
        this.gl.shaderSource(fragmentShader, fragmentShaderSource);
        this.gl.compileShader(fragmentShader);
        if (!this.gl.getShaderParameter(fragmentShader, this.gl.COMPILE_STATUS)) {
            console.error("ERROR compiling fragment shader:", this.gl.getShaderInfoLog(fragmentShader));
            return;
        }

        const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        if(!vertexShader) {
            console.error("Error creating vertex shader");
            return
        }
        this.gl.shaderSource(vertexShader, vertexShaderSource);
        this.gl.compileShader(vertexShader);
        if (!this.gl.getShaderParameter(vertexShader, this.gl.COMPILE_STATUS)) {
            console.error("ERROR compiling vertex shader:", this.gl.getShaderInfoLog(vertexShader));
            return;
        }
        const shaderProgram = this.gl.createProgram();
        this.gl.attachShader(shaderProgram, fragmentShader);
        this.gl.attachShader(shaderProgram, vertexShader);
        this.gl.linkProgram(shaderProgram);

        if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
            console.error("ERROR linking program:", this.gl.getProgramInfoLog(shaderProgram));
            return;
        }
        this.gl.useProgram(shaderProgram);
        this.aPositionLoc = this.gl.getAttribLocation(shaderProgram, "aPosition");
        this.gl.enableVertexAttribArray(this.aPositionLoc);
        this.aNormalLoc = this.gl.getAttribLocation(shaderProgram, "aNormal");
        this.gl.enableVertexAttribArray(this.aNormalLoc);
        this.aUVLoc = this.gl.getAttribLocation(shaderProgram, "aUV");
        this.gl.enableVertexAttribArray(this.aUVLoc);

        this.uModelMatrixLoc = this.gl.getUniformLocation(shaderProgram, "uModelMatrix");
        this.uProjectionViewMatrixLoc = this.gl.getUniformLocation(shaderProgram, "uProjectionViewMatrix");

        this.uCameraPositionLoc = this.gl.getUniformLocation(shaderProgram, "uCameraPosition");
        this.uAmbientLoc = this.gl.getUniformLocation(shaderProgram, "uAmbient");
        this.uDiffuseLoc = this.gl.getUniformLocation(shaderProgram, "uDiffuse");
        this.uSpecularLoc = this.gl.getUniformLocation(shaderProgram, "uSpecular");
        this.uShininessLoc = this.gl.getUniformLocation(shaderProgram, "uShininess");
        this.uAlphaLoc = this.gl.getUniformLocation(shaderProgram, "uAlpha");
        this.uUsingTextureLoc = this.gl.getUniformLocation(shaderProgram, "uUsingTexture");
        this.uTextureLoc = this.gl.getUniformLocation(shaderProgram, "uTexture");

        this.gl.uniform3fv(this.uCameraPositionLoc, this.camera.getPosition());
        this.lights.forEach((light, index) => {
            this.gl.uniform3fv(this.gl.getUniformLocation(shaderProgram, `uLightPosition[${index}]`), light.position);
            this.gl.uniform3fv(this.gl.getUniformLocation(shaderProgram, `uLightAmbient[${index}]`), light.ambient);
            this.gl.uniform3fv(this.gl.getUniformLocation(shaderProgram, `uLightDiffuse[${index}]`), light.diffuse);
            this.gl.uniform3fv(this.gl.getUniformLocation(shaderProgram, `uLightSpecular[${index}]`), light.specular);
        })
    }

    private renderObjects(): void {
        this.animationFrameId = requestAnimationFrame(this.renderObjects.bind(this));
        const projectionMatrix = this.camera.getProjectionMatrix();
        const viewMatrix = this.camera.getViewMatrix();
        const projectionViewMatrix = mat4.multiply(mat4.create(), projectionMatrix, viewMatrix);
        this.gl.uniform3fv(this.uCameraPositionLoc!, this.camera.getPosition());
        this.gl.uniformMatrix4fv(this.uProjectionViewMatrixLoc!, false, projectionViewMatrix);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        if(!this.uModelMatrixLoc ||
            !this.uProjectionViewMatrixLoc ||
            !this.uCameraPositionLoc ||
            !this.uAmbientLoc ||
            !this.uDiffuseLoc ||
            !this.uSpecularLoc ||
            !this.uShininessLoc ||
            !this.uAlphaLoc ||
            !this.uUsingTextureLoc ||
            !this.uTextureLoc ||
            this.aPositionLoc === undefined ||
            this.aNormalLoc === undefined ||
            this.aUVLoc === undefined
        ) {
            console.error("Uniform and attribute locations not set");
            return;
        }

        this.objects.forEach((object: ProcessedDrawable) => {
            this.gl.uniformMatrix4fv(this.uModelMatrixLoc!, false, object.getModelMatrix());
            const material = object.getMaterial();
            this.gl.uniform3fv(this.uAmbientLoc!, material.ambient);
            this.gl.uniform3fv(this.uDiffuseLoc!, material.diffuse);
            this.gl.uniform3fv(this.uSpecularLoc!, material.specular);
            this.gl.uniform1f(this.uShininessLoc!, material.n);
            this.gl.uniform1f(this.uAlphaLoc!, material.alpha);
            this.gl.uniform1i(this.uUsingTextureLoc!, material.texturePath ? 1 : 0);
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, object.getTexture());
            this.gl.uniform1i(this.uTextureLoc!, 0);

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.getVertexBuffer());
            this.gl.vertexAttribPointer(this.aPositionLoc!, 3, this.gl.FLOAT, false, 0, 0);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.getNormalBuffer());
            this.gl.vertexAttribPointer(this.aNormalLoc!, 3, this.gl.FLOAT, false, 0, 0);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.getUVBuffer());
            this.gl.vertexAttribPointer(this.aUVLoc!, 2, this.gl.FLOAT, false, 0, 0);

            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, object.getTriangleBuffer());
            this.gl.drawElements(this.gl.TRIANGLES, object.getTriangles().length, this.gl.UNSIGNED_SHORT, 0);
        });
    }

    public destroy(): void {
        if(this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }
}
  