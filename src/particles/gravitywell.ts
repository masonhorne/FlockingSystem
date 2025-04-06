import { vec3 } from 'gl-matrix';
import { Particle } from './particle';
import { MASS_OF_BLACK_HOLE } from './particleconstants';
export class GravityWell extends Particle {

    constructor(position: vec3, radius: number, centerPoint: vec3) {
        super(position, radius, centerPoint);
        const model = this.getModel();
        const black = vec3.fromValues(0, 0, 0);
        const faintGlow = vec3.fromValues(0.1, 0.1, 0.2);
        const material = model.getMaterial();
        model.setMaterial({
            ...material,
            diffuse: black,
            specular: black,
            ambient: faintGlow,
        });
    }

    override update(deltaTime: number): void { }

    override getMass(): number {
        return MASS_OF_BLACK_HOLE;
    }
}