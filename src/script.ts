import { vec3 } from 'gl-matrix';
import { Camera } from './camera';
import { Floor } from './model/floor';
import { Scene } from './scene';

const floor = new Floor(
    vec3.fromValues(-10, 0, -10),
    20,
    vec3.fromValues(0.2, 0.2, 0.2),
    vec3.fromValues(0, 0, 0),
    vec3.fromValues(0, 0, 0),
    1,
    0.1,
    undefined,
)

const camera = new Camera(
    vec3.fromValues(-25, 10, -25),
    vec3.fromValues(0, 0, 0),
    vec3.fromValues(0, 1, 0),
    Math.PI / 4,
    1,
    0.1,
    100000,
)

const light = {
    position: vec3.fromValues(0, 10, 0),
    diffuse: vec3.fromValues(1, 1, 1),
    specular: vec3.fromValues(1, 1, 1),
    ambient: vec3.fromValues(1, 1, 1),
}

const canvas = document.getElementById('canvas');

if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error("Canvas not found");
}

const scene = new Scene(canvas, camera);
scene.addLight(light);
scene.addObject(floor);

function handleKeyDown(event: KeyboardEvent) {
    switch (event.key) {
        case "w":
            camera.moveForward();
            break;
        case "W":
            camera.tiltUp();
            break;
        case "s":
            camera.moveBackward();
            break;
        case "S":
            camera.tiltDown();
            break;
        case "a":
            camera.moveLeft();
            break;
        case "A":
            camera.tiltLeft();
            break;
        case "d":
            camera.moveRight();
            break;
        case "D":
            camera.tiltRight();
            break;
    }
}
document.onkeydown = handleKeyDown;