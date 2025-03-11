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
    this.tiltSpeed = 10;

    mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);
    mat4.perspective(this.projectionMatrix, fov, aspect, near, far);
  }

  getViewMatrix(): mat4 {
    return this.viewMatrix;
  }

  getProjectionMatrix(): mat4 {
    return this.projectionMatrix;
  }

  getPosition(): vec3 {
    return this.position;
  }

  moveForward() {
    const forward = vec3.create();
    vec3.sub(forward, this.target, this.position);
    vec3.normalize(forward, forward);
    vec3.scale(forward, forward, this.speed);
    vec3.add(this.position, this.position, forward);
    vec3.add(this.target, this.target, forward);
    this.updateViewMatrix();
  }

  moveBackward() {
    const backward = vec3.create();
    vec3.sub(backward, this.position, this.target);
    vec3.normalize(backward, backward);
    vec3.scale(backward, backward, this.speed);
    vec3.add(this.position, this.position, backward);
    vec3.add(this.target, this.target, backward);
    this.updateViewMatrix();
  }

  moveLeft() {
    const left = vec3.create();
    const forward = vec3.create();
    vec3.sub(forward, this.target, this.position);
    vec3.normalize(forward, forward);
    vec3.cross(left, this.up, forward);
    vec3.normalize(left, left);
    vec3.scale(left, left, this.speed);
    vec3.add(this.position, this.position, left);
    vec3.add(this.target, this.target, left);
    this.updateViewMatrix();
  }

  moveRight() {
    const right = vec3.create();
    const forward = vec3.create();
    vec3.sub(forward, this.target, this.position);
    vec3.normalize(forward, forward);
    vec3.cross(right, forward, this.up);
    vec3.normalize(right, right);
    vec3.scale(right, right, this.speed);
    vec3.add(this.position, this.position, right);
    vec3.add(this.target, this.target, right);
    this.updateViewMatrix();
  }


  tiltUp() {
    const rotationMatrix = mat4.create();
    mat4.rotateX(rotationMatrix, rotationMatrix, this.tiltSpeed * Math.PI / 180);
    vec3.transformMat4(this.target, this.target, rotationMatrix);
    this.updateViewMatrix();
  }

  tiltDown() {
    const rotationMatrix = mat4.create();
    mat4.rotateX(rotationMatrix, rotationMatrix, -this.tiltSpeed * Math.PI / 180);
    vec3.transformMat4(this.target, this.target, rotationMatrix);
    this.updateViewMatrix();
  }

  tiltLeft() {
    const rotationMatrix = mat4.create();
    mat4.rotateY(rotationMatrix, rotationMatrix, this.tiltSpeed * Math.PI / 180);
    vec3.transformMat4(this.target, this.target, rotationMatrix);
    this.updateViewMatrix();
  }

  tiltRight() {
    const rotationMatrix = mat4.create();
    mat4.rotateY(rotationMatrix, rotationMatrix, -this.tiltSpeed * Math.PI / 180);
    vec3.transformMat4(this.target, this.target, rotationMatrix);
    this.updateViewMatrix();
  }


  private updateViewMatrix() {
    mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);
  }
}