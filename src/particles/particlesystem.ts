import { vec3 } from 'gl-matrix';
import { Settings } from '../settings';
import { ParticleObserver } from './observers/particleobserver';
import { ParticleSystemObserver } from './observers/particlesystemobserver';
import { Particle } from './particle';


export class ParticleSystem implements ParticleObserver {
    private particles: Particle[];
    private centerPoint: vec3;
    private lastAnimationTime: number = 0;
    private settings: Settings = Settings.getInstance();
    private observers: ParticleSystemObserver[] = [];
    private totalParticles: number;

    private animationFrameId: number | undefined;

    constructor(totalParticles: number, centerPoint: vec3) {
        this.centerPoint = centerPoint;
        this.totalParticles = totalParticles;
        this.particles = this.generateParticles(totalParticles);
        this.animate(0);
    }

    private animate(currentTime: number): void {
        const deltaTime = currentTime - this.lastAnimationTime;
        this.lastAnimationTime = currentTime;
        this.update(deltaTime);
        this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    }

    public addObserver(observer: ParticleSystemObserver): void {
        this.observers.push(observer);
    }

    public removeObserver(observer: ParticleSystemObserver): void {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }

    private generateParticle(ringRadius: number) {
        const randomAngle = Math.random() * Math.PI * 2;
        const randomRadius = ringRadius + (Math.random() - 0.5) * 2;
        const x = this.centerPoint[0] + randomRadius * Math.cos(randomAngle);
        const z = this.centerPoint[2] + randomRadius * Math.sin(randomAngle);
        const position = vec3.fromValues(x, this.centerPoint[1], z);
        const radius = this.settings.getSettings().randomSize
            ? Math.random() * 0.4 + 0.2
            : this.settings.getSettings().particleSize;
        return new Particle(position, radius, this.centerPoint);
    }

    private generateParticles(
        totalParticles: number,
    ): Particle[] {
        const particles: Particle[] = [];
        let particleCount = 0;
        let ringRadius = 3;
        let ringCount = 1;
        while (particleCount < totalParticles) {
            const particlesInRing = Math.min(ringCount * 6, totalParticles - particleCount);
            for (let i = 0; i < particlesInRing && particleCount < totalParticles; i++) {
                // Skip creation based on a random chance.
                if (Math.random() < 0.1) continue;
                particles.push(this.generateParticle(ringRadius));
                particleCount++;
            }
            ringRadius += ringCount * 0.5;
            ringCount++;
        }
        return particles;
    }


    public handleParticleDeath(particle: Particle): void {
        const index = this.particles.indexOf(particle);
        if (index > -1) {
            this.particles.splice(index, 1);
            const baseRingRadius = 2;
            const variableRingRadius = 3 * (this.totalParticles / (1000 * Math.random()));
            const replacementParticle = this.generateParticle(baseRingRadius + variableRingRadius);
            replacementParticle.addObserver(this);
            this.particles.push(replacementParticle);
            for (const observer of this.observers) {
                observer.removeParticle(particle);
                observer.addParticle(replacementParticle);
            }
        }
    }

    public getParticles(): Particle[] {
        return this.particles;
    }

    public update(deltaTime: number): void {
        for(const particle1 of this.particles) {
            for(const particle2 of this.particles) {
                if(particle1 === particle2) continue;
                if(this.settings.getSettings().particleCollisions && particle1.intersects(particle2)) {
                    particle1.kill(true);
                    particle2.kill(true);
                }
                particle1.applyGravity(particle2);
            }
            particle1.applyGravity(this.centerPoint);
            particle1.applyWind();
        }
        for(const particle of this.particles) {
            particle.update(deltaTime);
        }
    }

    public stop(): void {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }
}