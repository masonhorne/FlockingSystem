import { vec3 } from "gl-matrix";
import { Particle } from "./particle";

export class ParticleGenerator {
    public static generateParticles(
        totalParticles: number,
        centerPoint: vec3,
    ) {
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
                const radius = Math.random() * 0.3 + 0.2; 
                particles.push(new Particle(position, radius));
                particleCount++;
            }
            ringRadius += 2 + ringCount; 
            ringCount++;
        }
        return particles;
    }
}