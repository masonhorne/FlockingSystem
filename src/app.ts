import { vec3 } from 'gl-matrix';
import { Camera } from './camera';
import { Floor } from './model/floor';
import { Planet } from './model/planet';
import { GravityWell } from './particles/gravitywell';
import { ParticleSystem } from './particles/particlesystem';
import { Scene } from './scene';
import { Settings } from './settings';
import { UiHandler } from './uihandler';

export class App {
    private readonly settings = Settings.getInstance();
    private readonly center = vec3.fromValues(0, this.settings.getSettings().yPlane, 0);
    private readonly camera = this.createCamera();

    private readonly light1 = this.createLight(this.center);
    private readonly light2 = this.createLight(vec3.fromValues(0, 10, 0));

    private readonly canvas: HTMLCanvasElement;
    private scene: Scene;
    private particleSystem?: ParticleSystem;
    private uiHandler: UiHandler;

    constructor() {
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this.scene = new Scene(this.canvas, this.camera);
        this.resetScene();
        this.uiHandler = new UiHandler(this.camera, this.resetScene.bind(this), this.dropObject.bind(this));
    }

    private createCamera(): Camera {
        return new Camera(
            vec3.fromValues(-25, 25, -25),
            vec3.fromValues(0, 0, 0),
            vec3.fromValues(0, 1, 0),
            Math.PI / 4,
            1,
            0.1,
            100000,
        );
    }

    private createLight(position: vec3) {
        return {
            position,
            diffuse: vec3.fromValues(1, 1, 1),
            specular: vec3.fromValues(1, 1, 1),
            ambient: vec3.fromValues(1, 1, 1),
        };
    }

    private createSun(): Planet {
        return new Planet(
            this.center,
            1,
            vec3.fromValues(1, 1, 0),
            vec3.fromValues(0.1, 0.1, 0.1),
            vec3.fromValues(0.2, 0.2, 0.2),
            3,
            1,
            undefined,
        );
    }

    private createFloor(): Floor {
        return new Floor(
            vec3.fromValues(-10, 0, -10),
            20,
            vec3.fromValues(0.2, 0.2, 0.2),
            vec3.fromValues(0, 0, 0),
            vec3.fromValues(0, 0, 0),
            1,
            0.4,
            undefined,
        );
    }

    private resetScene(): void {
        if (this.particleSystem) {
            const existingParticles = this.particleSystem.getParticles();
            existingParticles.forEach(p => p.removeObserver(this.particleSystem!));
            this.particleSystem.removeObserver(this.scene);
            this.particleSystem.stop();
        }
        this.scene.destroy();
        this.scene = new Scene(this.canvas, this.camera);
        this.scene.addLight(this.light1);
        this.scene.addLight(this.light2);
        this.scene.addObject(this.createFloor());
        this.scene.addObject(this.createSun());
        this.particleSystem = new ParticleSystem(this.settings.getSettings().totalParticles, this.center);
        this.particleSystem.getParticles().forEach(p => {
            this.scene.addObject(p.getModel());
            p.addObserver(this.particleSystem!);
        });
        this.particleSystem.addObserver(this.scene);
    }

    private dropObject(position: vec3): void {
        const gravityWell = new GravityWell(position, 1, this.center);
        this.particleSystem?.addParticle(gravityWell);
    }
}
