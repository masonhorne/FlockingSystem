import { vec3 } from 'gl-matrix';
import { Camera } from './camera';
import { Floor } from './model/floor';
import { Planet } from './model/planet';
import { GravityWell } from './particles/gravitywell';
import { ParticleSystem } from './particles/particlesystem';
import { Scene } from './scene';
import { Settings } from './settings';
import { UiHandler } from './uihandler';

var settings = Settings.getInstance();
const center = vec3.fromValues(0, settings.getSettings().yPlane, 0);

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
var particleSystem: ParticleSystem | undefined;

function resetSceneCallback() {
    if(particleSystem) {
        const existingParticles = particleSystem.getParticles();
        existingParticles.forEach(particle => {
            particle.removeObserver(particleSystem!);
        });
        particleSystem.removeObserver(scene);
    }
    scene.destroy();
    scene = new Scene(canvas, camera);
    scene.addLight(light);
    scene.addLight(light2);
    scene.addObject(floor);
    scene.addObject(sun);
    particleSystem?.stop();
    particleSystem = new ParticleSystem(settings.getSettings().totalParticles, center);
    const particles = particleSystem.getParticles();
    particles.forEach(particle => {
        scene.addObject(particle.getModel());
        particle.addObserver(particleSystem!);
    });
    particleSystem.addObserver(scene);
}

function dropObjectCallback(position: vec3) {
    const black = vec3.fromValues(0, 0, 0);
    const faintGlow = vec3.fromValues(0.1, 0.1, 0.2);
    const planet = new Planet(
        position,
        1,
        black,
        black,
        faintGlow,
        10,
        1,
        undefined,
    );
    const particle = new GravityWell(
        position,
        1,
        center
    )
    particleSystem?.addParticle(particle);
}

resetSceneCallback();
const uiHandler = new UiHandler(camera, resetSceneCallback, dropObjectCallback);