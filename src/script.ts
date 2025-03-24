import { vec3 } from 'gl-matrix';
import { Camera } from './camera';
import { Floor } from './model/floor';
import { Planet } from './model/planet';
import { ParticleSystem } from './particles/particlesystem';
import { Scene } from './scene';
import { UiHandler } from './uihandler';

const center = vec3.fromValues(0, 1, 0);

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
    center,
    1,
    vec3.fromValues(1, 1, 0),
    vec3.fromValues(.1, .1, .1),
    vec3.fromValues(.2, .2, .2),
    3,
    1,
    undefined,
)

const camera = new Camera(
    vec3.fromValues(-25, 25, -25), // ISOMETRIC VIEW
    // vec3.fromValues(1, 40, 0), // TOP DOWN VIEW
    vec3.fromValues(0, 0, 0),
    vec3.fromValues(0, 1, 0),
    Math.PI / 4,
    1,
    0.1,
    100000,
)

const light = {
    position: center,
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

const canvas = document.getElementById('canvas') as HTMLCanvasElement;

var scene = new Scene(canvas, camera);

function resetSceneCallback() {
    scene.destroy();
    scene = new Scene(canvas, camera);
    scene.addLight(light);
    scene.addLight(light2);
    scene.addObject(floor);
    scene.addObject(sun);
    const particleSystem = new ParticleSystem(50, center);
    const particles = particleSystem.getParticles();
    particles.forEach(particle => scene.addObject(particle.getModel()));
}

resetSceneCallback();
const uiHandler = new UiHandler(camera, resetSceneCallback);