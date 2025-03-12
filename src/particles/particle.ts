import { vec3 } from "gl-matrix";
import { Planet } from "../model/planet";

export class Particle {
    private position: vec3;
    private radius: number;
    private planetModel: Planet;

    constructor(position: vec3, radius: number) {
        this.position = position;
        this.radius = radius;
        const randomColor = vec3.fromValues(Math.random(), Math.random(), Math.random());
        this.planetModel = new Planet(
            position,
            radius,
            randomColor,
            randomColor,
            randomColor,
            10,
            1,
            undefined,
        );
    }

    public getModel(): Planet {
        return this.planetModel;
    }
}