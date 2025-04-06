import { mat4, vec3 } from "gl-matrix";
import { Camera } from "./camera";
import { Settings } from "./settings";

export class RayTracer {
    private cameraPosition: vec3;
    private projectionMatrix: mat4;
    private viewMatrix: mat4;
    private settings: Settings;

    constructor(camera: Camera) {
        this.cameraPosition = camera.getPosition();
        this.projectionMatrix = camera.getProjectionMatrix();
        this.viewMatrix = camera.getViewMatrix();
        this.settings = Settings.getInstance();
    }

    computeClickIntersection(event: MouseEvent): vec3 | null {
        const { x, y } = this.getMouseNDC(event);
        const ray = this.getRayFromCamera(x, y);
        return this.intersectRayWithPlane(ray.origin, ray.direction, this.settings.getSettings().yPlane);
    }

    private getMouseNDC(event: MouseEvent): { x: number; y: number } {
        const canvas = event.target as HTMLCanvasElement;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
        return { x, y };
    }

    private getRayFromCamera(ndcX: number, ndcY: number) {
        const invProjView = mat4.create();
        mat4.multiply(invProjView, this.projectionMatrix, this.viewMatrix);
        mat4.invert(invProjView, invProjView);
        const nearPoint = vec3.fromValues(ndcX, ndcY, -1);
        const farPoint = vec3.fromValues(ndcX, ndcY, 1);
        vec3.transformMat4(nearPoint, nearPoint, invProjView);
        vec3.transformMat4(farPoint, farPoint, invProjView);
        const direction = vec3.create();
        vec3.subtract(direction, farPoint, nearPoint);
        vec3.normalize(direction, direction);
        return { origin: vec3.clone(this.cameraPosition), direction };
    }

    private intersectRayWithPlane(origin: vec3, direction: vec3, planeY: number): vec3 | null {
        if (Math.abs(direction[1]) < 1e-6) return null;
        const t = (planeY - origin[1]) / direction[1];
        if (t < 0) return null;
        const intersection = vec3.create();
        vec3.scaleAndAdd(intersection, origin, direction, t);
        return intersection;
    }
}
