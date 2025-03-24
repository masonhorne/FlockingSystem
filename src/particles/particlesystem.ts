import { vec3 } from 'gl-matrix';
import { Settings } from '../settings';
import { Particle } from './particle';


export class ParticleSystem {
    private particles: Particle[];
    private centerPoint: vec3;
    private lastAnimationTime: number = 0;
    private settings: Settings = Settings.getInstance();

    constructor(totalParticles: number, centerPoint: vec3) {
        this.centerPoint = centerPoint;
        this.particles = this.generateParticles(totalParticles, centerPoint);
        this.animate(0);
    }

    private animate(currentTime: number): void {
        const deltaTime = currentTime - this.lastAnimationTime;
        this.lastAnimationTime = currentTime;
        this.update(deltaTime);
        requestAnimationFrame(this.animate.bind(this));
    }

    private generateParticles(
        totalParticles: number,
        centerPoint: vec3,
    ): Particle[] {
        const particles: Particle[] = [];
        let particleCount = 0;
        let ringRadius = 3;
        let ringCount = 1;
        while (particleCount < totalParticles) {
            const particlesInRing = Math.min(ringCount * 6, totalParticles - particleCount);
            for (let particle = 0; particle < particlesInRing && particleCount < totalParticles; particle++) {
                if (Math.random() < 0.1) continue;
                const randomAngle = Math.random() * Math.PI * 2;
                const randomRadius = ringRadius + (Math.random() - 0.5) * 2; 
                const x = centerPoint[0] + randomRadius * Math.cos(randomAngle);
                const z = centerPoint[2] + randomRadius * Math.sin(randomAngle);
                const position = vec3.fromValues(x, centerPoint[1], z);
                const radius = this.settings.getSettings().randomSize ? 
                    Math.random() * 0.4 + 0.2 
                    : this.settings.getSettings().particleSize;
                particles.push(new Particle(position, radius, centerPoint));
                particleCount++;
            }
            ringRadius += ringCount * 0.5; 
            ringCount++;
        }
        return particles;
    }

    public getParticles(): Particle[] {
        return this.particles;
    }

    public update(deltaTime: number): void {
        for(const particle1 of this.particles) {
            for(const particle2 of this.particles) {
                if(particle1 === particle2) continue;
                if(this.settings.getSettings().particleCollisions && particle1.intersects(particle2)) {
                    particle1.kill();
                    particle2.kill();
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
}