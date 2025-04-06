import { vec3 } from "gl-matrix";
import { ObjModelParams } from "./model/objprocessor";

type SettingsValue = {
    gravitationalCoefficient: number;
    maxSpeed: number;
    windX: number;
    windZ: number;
    customModelData: ObjModelParams | undefined;
    particleColor: vec3;
    particleSize: number;
    randomSize: boolean;
    randomColor: boolean;
    particleCollisions: boolean;
    totalParticles: number;
    yPlane: number;
    dropGravityWell: boolean;
}

export const DEFAULT_GRAVITATIONAL_COEFFICIENT = 6.67430e-10;
export const DEFAULT_PARTICLE_SIZE = 0.2;
export const DEFAULT_PARTICLE_COLOR = vec3.fromValues(1, 1, 1);

export class Settings {
    private static instance: Settings;

    private settings: SettingsValue = {
        gravitationalCoefficient: DEFAULT_GRAVITATIONAL_COEFFICIENT,
        maxSpeed: 0.001,
        windX: 0,
        windZ: 0,
        customModelData: undefined,
        particleColor: DEFAULT_PARTICLE_COLOR,
        particleSize: DEFAULT_PARTICLE_SIZE,
        randomSize: true,
        randomColor: true,
        particleCollisions: false,
        totalParticles: 25,
        yPlane: 1,
        dropGravityWell: true,
    };

    private constructor() {}

    public static getInstance(): Settings {
        if (!Settings.instance) {
            Settings.instance = new Settings();
        }
        return Settings.instance;
    }

    public getSettings(): SettingsValue {
        return this.settings;
    }
}