import { Particle } from '../particle';
export interface ParticleSystemObserver {
    removeParticle(particle: Particle): void;
    addParticle(particle: Particle): void;
}