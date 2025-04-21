import { vec3 } from "gl-matrix";
import { Drawable } from "../model/drawable";
import { Obj } from "../model/obj";
import { Planet } from "../model/planet";
import { TextureFactory } from "../model/texturefactory";
import { Settings } from "../settings";
import { ParticleObserver } from "./observers/particleobserver";
import { MASS_OF_SUN, MAX_DISTANCE, ORBIT_WEIGHT, ROTATION_DENOMINATOR, WIND_WEIGHT } from "./particleconstants";

export class Particle {
    private velocity: vec3;
    private centerPoint: vec3;
    private acceleration: vec3;
    private radius: number;
    private mass: number;
    private model!: Drawable; // Model will be set in the constructors call to setupModel
    private settings: Settings = Settings.getInstance();
    private reverse: boolean = false;
    private minBounds: vec3 = vec3.fromValues(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
    private maxBounds: vec3 = vec3.fromValues(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
    private isDead: boolean = false;
    private collided: boolean = false;
    private observers: ParticleObserver[] = [];
    private lifeTime: number;

    constructor(position: vec3, radius: number, centerPoint: vec3) {
        this.radius = radius;
        this.centerPoint = centerPoint;
        const toSun = vec3.negate(vec3.create(), position);
        const up = vec3.fromValues(0, 1, 0);
        this.velocity = vec3.cross(vec3.create(), toSun, up);
        if(Math.random() < 0.5) {
            this.reverse = true;
            vec3.negate(this.velocity, this.velocity);
        }
        this.acceleration = vec3.fromValues(0, 0, 0);
        const volume = 4 / 3 * Math.PI * Math.pow(this.radius, 3);
        const density = Math.random();
        this.mass = volume * density;
        this.lifeTime = 1000 + Math.random() * 10000 * this.getMass();
        this.setupModel(position, radius);
    }

    private setupModel(position: vec3, radius: number) {
        const initialPosition = vec3.fromValues(0, 0, 0);
        const color = this.settings.getSettings().randomColor ?
            vec3.fromValues(Math.random(), Math.random(), Math.random())
            : this.settings.getSettings().particleColor;
        const objData = this.settings.getSettings().customModelData;
        if(objData) {
            this.model = new Obj(
                objData,
                radius * 10,
                initialPosition,
                color,
                color,
                color,
                10,
                1,
                undefined,
            )
        } else {
            const randomTexture = TextureFactory.getRandomTexture();
            this.model = new Planet(
                initialPosition,
                radius,
                color,
                color,
                color,
                10,
                1,
                randomTexture,
            );
        }
        this.model.setTranslation(position);
        // Find the bounds for the particle based on the models vertices
        const vertices = this.model.getVertices();
        for (let i = 0; i < vertices.length; i += 3) {
            const vertex = vec3.fromValues(vertices[i], vertices[i + 1], vertices[i + 2]);
            vec3.min(this.minBounds, this.minBounds, vertex);
            vec3.max(this.maxBounds, this.maxBounds, vertex);
        }
    }

    public applyGravity(other: Particle | vec3) {
        const isParticle = other instanceof Particle;
        const otherPosition = isParticle ? other.getPosition() : other;
        const direction = vec3.subtract(vec3.create(), otherPosition, this.getPosition());
        const distance = vec3.length(direction);
        if(distance < 1) return;
        vec3.normalize(direction, direction);
        const massOther = isParticle ? other.getMass() : MASS_OF_SUN;
        const gravitationalCoefficient = this.settings.getSettings().gravitationalCoefficient;
        const gravitationalForce = (gravitationalCoefficient * this.mass * massOther) / (distance * distance);
        const gravitationalAcceleration = vec3.scale(vec3.create(), direction, gravitationalForce / this.mass);
        vec3.add(this.acceleration, this.acceleration, gravitationalAcceleration);
    }

    public addObserver(observer: ParticleObserver) {
        this.observers.push(observer);
    }

    public removeObserver(observer: ParticleObserver) {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }

    private notifyObservers() {
        for(const observer of this.observers) {
            observer.handleParticleDeath(this);
        }
    }

    public applyWind() {
        const wind = vec3.fromValues(
            this.settings.getSettings().windX,
            0,
            this.settings.getSettings().windZ,
        );
        vec3.scale(wind, wind, WIND_WEIGHT);
        vec3.add(this.acceleration, this.acceleration, wind);
    }
    

    public update(deltaTime: number) {
        if(this.isDead) {
            const currentMaterial = this.model.getMaterial();
            const newAlpha = currentMaterial.alpha - 0.001;
            if(newAlpha <= 0) {
                // Remove model from scene and particle system
                this.notifyObservers();
                return;
            }
            this.model.setMaterial({
                ...currentMaterial,
                alpha: newAlpha,
            });
            // Don't update movement for collided particles
            if(this.collided) return;
        }
        // Orbit movement
        const toCenter = vec3.subtract(vec3.create(), this.centerPoint, this.getPosition());
        const toCenterNormalized = vec3.normalize(vec3.create(), toCenter);
        const tangent = vec3.cross(vec3.create(), toCenterNormalized, vec3.fromValues(0, 1, 0));
        if(this.reverse) vec3.negate(tangent, tangent);
        vec3.normalize(tangent, tangent);
        const velocityLength = vec3.length(this.velocity);
        const desiredVelocity = vec3.scale(vec3.create(), tangent, velocityLength);
        const steer = vec3.subtract(vec3.create(), desiredVelocity, this.velocity);
        vec3.scale(steer, steer, ORBIT_WEIGHT);
        vec3.add(this.velocity, this.velocity, steer);
    
        // Gravity/Wind movement
        const velocityChange = vec3.scale(vec3.create(), this.acceleration, deltaTime);
        vec3.add(this.velocity, this.velocity, velocityChange);
    
        const maxSpeed = this.settings.getSettings().maxSpeed;
        if (vec3.length(this.velocity) > maxSpeed) {
            vec3.normalize(this.velocity, this.velocity);
            vec3.scale(this.velocity, this.velocity, maxSpeed);
        }
        const position = vec3.clone(this.getPosition());
        const positionChange = vec3.scale(vec3.create(), this.velocity, deltaTime);
        vec3.add(position, position, positionChange);
        for (let i of [0, 2]) {
            if (position[i] < -MAX_DISTANCE || position[i] > MAX_DISTANCE) {
                position[i] = Math.max(-MAX_DISTANCE, Math.min(MAX_DISTANCE, position[i]));
                this.velocity[i] = 0;
            }
        }
        this.model.setTranslation(position);
        this.model.rotate(vec3.fromValues(0, 1, 0), Math.PI / ROTATION_DENOMINATOR * (this.reverse ? -1 : 1));    
        vec3.set(this.acceleration, 0, 0, 0);
        this.lifeTime -= 1;
        if(!this.isDead && this.lifeTime < 0) {
            this.kill();
        }
    }
    

    public getModel(): Drawable {
        return this.model;
    }

    public getPosition(): vec3 {
        return this.model.getTranslation();
    }

    public getMass(): number {
        return this.mass;
    }

    public getBounds() {
        const translation = this.model.getTranslation();
        const worldSpaceMin = vec3.add(vec3.create(), this.minBounds, translation);
        const worldSpaceMax = vec3.add(vec3.create(), this.maxBounds, translation);
        return {
            min: worldSpaceMin,
            max: worldSpaceMax,
        }
    }

    public intersects(other: Particle): boolean {
        const otherBounds = other.getBounds();
        const thisBounds = this.getBounds();
        const xIntersect = Math.min(thisBounds.max[0], otherBounds.max[0]) - Math.max(thisBounds.min[0], otherBounds.min[0]);
        const yIntersect = Math.min(thisBounds.max[1], otherBounds.max[1]) - Math.max(thisBounds.min[1], otherBounds.min[1]);
        const zIntersect = Math.min(thisBounds.max[2], otherBounds.max[2]) - Math.max(thisBounds.min[2], otherBounds.min[2]);
        return xIntersect > 0 && yIntersect > 0 && zIntersect > 0;
    }

    public kill(collided = false) {
        this.isDead = true;
        this.collided = collided;
    }
}