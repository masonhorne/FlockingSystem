import { mat4, vec3 } from 'gl-matrix';

export class Camera {
  private position: vec3;
  private target: vec3;
  private up: vec3;
  private viewMatrix: mat4;
  private projectionMatrix: mat4;
  private speed: number;
  private tiltSpeed: number;

  /**
   * Creates a camera object
   * @param position Point in space for camera
   * @param target Point in space for camera to look at
   * @param up Vector pointing up in the cameras view
   * @param fov Field of view in radians
   * @param aspect Aspect ratio of the camera
   * @param near Near clipping plane distance
   * @param far Far clipping plane distance
   */
  constructor(
    position: vec3,
    target: vec3,
    up: vec3,
    fov: number,
    aspect: number,
    near: number,
    far: number
  ) {
    this.position = position;
    this.target = target;
    this.up = up;
    this.viewMatrix = mat4.create();
    this.projectionMatrix = mat4.create();
    this.speed = 1;
    this.tiltSpeed = 5;

    mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);
    mat4.perspective(this.projectionMatrix, fov, aspect, near, far);
  }

  public getViewMatrix(): mat4 {
    return this.viewMatrix;
  }

  public getProjectionMatrix(): mat4 {
    return this.projectionMatrix;
  }

  public getPosition(): vec3 {
    return this.position;
  }

  public moveForward() {
    const forward = vec3.create();
    vec3.sub(forward, this.target, this.position);
    const lookAt = vec3.normalize(forward, forward);
    vec3.add(this.target, vec3.clone(this.target), vec3.scale(forward, lookAt, this.speed));
    vec3.add(this.position, vec3.clone(this.position), vec3.scale(forward, lookAt, this.speed));
    this.updateViewMatrix();
  }

  public moveBackward() {
    const forward = vec3.create();
    vec3.sub(forward, this.target, this.position);
    const lookAt = vec3.normalize(forward, forward);
    vec3.sub(this.target, vec3.clone(this.target), vec3.scale(forward, lookAt, this.speed));
    vec3.sub(this.position, vec3.clone(this.position), vec3.scale(forward, lookAt, this.speed));
    this.updateViewMatrix();
  }

  public moveLeft() {
    const forward = vec3.create();
    vec3.sub(forward, this.target, this.position);
    const lookAt = vec3.normalize(forward, forward);
    const viewRight = vec3.normalize(vec3.create(), vec3.cross(forward, lookAt, this.up));
    vec3.add(this.target, vec3.clone(this.target), vec3.scale(forward, viewRight, -this.speed));
    vec3.add(this.position, vec3.clone(this.position), vec3.scale(forward, viewRight, -this.speed));
    this.updateViewMatrix();
  }

  public moveRight() {
    const forward = vec3.create();
    vec3.sub(forward, this.target, this.position);
    const lookAt = vec3.normalize(forward, forward);
    const viewRight = vec3.normalize(vec3.create(), vec3.cross(forward, lookAt, this.up));
    vec3.add(this.target, vec3.clone(this.target), vec3.scale(forward, viewRight, this.speed));
    vec3.add(this.position, vec3.clone(this.position), vec3.scale(forward, viewRight, this.speed));
    this.updateViewMatrix();
  }


  public tiltUp() {
    const forward = vec3.create();
    vec3.sub(forward, this.target, this.position);
    vec3.normalize(forward, forward);
    const right = vec3.create();
    vec3.cross(right, forward, this.up);
    vec3.normalize(right, right);
    const rotationMatrix = mat4.create();
    mat4.fromRotation(rotationMatrix, this.tiltSpeed * Math.PI / 180, right);
    vec3.transformMat4(forward, forward, rotationMatrix);
    vec3.add(this.target, this.position, forward);
    this.updateViewMatrix();
  }

  public tiltDown() {
    const forward = vec3.create();
    vec3.sub(forward, this.target, this.position);
    vec3.normalize(forward, forward);
    const right = vec3.create();
    vec3.cross(right, forward, this.up);
    vec3.normalize(right, right);
    const rotationMatrix = mat4.create();
    mat4.fromRotation(rotationMatrix, -this.tiltSpeed * Math.PI / 180, right);
    vec3.transformMat4(forward, forward, rotationMatrix);
    vec3.add(this.target, this.position, forward);
    this.updateViewMatrix();
  }

  public tiltLeft() {
    const forward = vec3.create();
    vec3.sub(forward, this.target, this.position);
    vec3.normalize(forward, forward);
    const rotationMatrix = mat4.create();
    mat4.fromRotation(rotationMatrix, this.tiltSpeed * Math.PI / 180, this.up);
    vec3.transformMat4(forward, forward, rotationMatrix);
    vec3.add(this.target, this.position, forward);
    this.updateViewMatrix();
  }

  public tiltRight() {
    const forward = vec3.create();
    vec3.sub(forward, this.target, this.position);
    vec3.normalize(forward, forward);
    const rotationMatrix = mat4.create();
    mat4.fromRotation(rotationMatrix, -this.tiltSpeed * Math.PI / 180, this.up);
    vec3.transformMat4(forward, forward, rotationMatrix);
    vec3.add(this.target, this.position, forward);
    this.updateViewMatrix();
  }


  private updateViewMatrix() {
    mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);
  }
}