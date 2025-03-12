import { vec3 } from 'gl-matrix';
import { Camera } from './camera';
import { Floor } from './model/floor';
import { Planet } from './model/planet';
import { ParticleGenerator } from './particles/particlegenerator';
import { Scene } from './scene';

const floor = new Floor(
    vec3.fromValues(-10, 0, -10),
    20,
    vec3.fromValues(0.2, 0.2, 0.2),
    vec3.fromValues(0, 0, 0),
    vec3.fromValues(0, 0, 0),
    1,
    0.4,
    undefined,
)


const sun = new Planet(
    vec3.fromValues(0, 1, 0),
    1,
    vec3.fromValues(1, 1, 0),
    vec3.fromValues(.1, .1, .1),
    vec3.fromValues(.2, .2, .2),
    3,
    1,
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
    position: vec3.fromValues(0, 1, 0),
    diffuse: vec3.fromValues(1, 1, 1),
    specular: vec3.fromValues(1, 1, 1),
    ambient: vec3.fromValues(1, 1, 1),
}

const light2 = {
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
scene.addLight(light2);
scene.addObject(floor);
scene.addObject(sun);

const particles = ParticleGenerator.generateParticles(10, vec3.fromValues(0, 1, 0));
particles.forEach(particle => scene.addObject(particle.getModel()));

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