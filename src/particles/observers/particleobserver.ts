import { Particle } from '../particle';
export interface ParticleObserver {
    handleParticleDeath(particle: Particle): void;
}