import { vec3 } from 'gl-matrix';
import { Drawable } from './drawable';

export class Planet extends Drawable {
    constructor(
        position: vec3,
        radius: number,
        diffuse: vec3,
        specular: vec3,
        ambient: vec3,
        n: number,
        alpha: number,
        texturePath: string | undefined
    ) {
        super(diffuse, specular, ambient, n, alpha, texturePath);
        this.generateSphere(position, radius);
    }

    private generateSphere(position: vec3, radius: number, verticalSteps: number = 32) {
        const inversePi = 1 / Math.PI;
        const twoPi = 2 * Math.PI;
        const inverseTwoPi = 1 / twoPi;
        const epsilon = 0.001 * Math.PI;
        // Initialize arrays with bottom pole
        const vertices = [position[0], position[1] - radius, position[2]];
        const uvs = [0.5, 0];
        const angleIncrement = twoPi / verticalSteps;
        const limitAngle = angleIncrement * (Math.floor(verticalSteps * 0.25) - 1);
        for(let latitudeAngle = -limitAngle; latitudeAngle <= limitAngle + epsilon; latitudeAngle += angleIncrement) {
            const latitudeRadius = Math.cos(latitudeAngle) * radius;
            const latitudeY = Math.sin(latitudeAngle) * radius;
            const latitudeV = latitudeAngle * inversePi + 0.5;
            for(let longitudeAngle = 0; longitudeAngle <= twoPi + epsilon; longitudeAngle += angleIncrement) {
                vertices.push(
                    -latitudeRadius * Math.sin(longitudeAngle) + position[0],
                    latitudeY + position[1],
                    latitudeRadius * Math.cos(longitudeAngle) + position[2],
                );
                uvs.push(
                    longitudeAngle * inverseTwoPi,
                    latitudeV,
                )
            }
        }
        // Add top pole
        vertices.push(position[0], position[1] + radius, position[2]);
        uvs.push(0.5, 1);
        const normals = vertices.slice();
        const triangles: number[] = [];
        const triangleCount = Math.floor(vertices.length / 3);
        for(let longitude = 1; longitude <= verticalSteps; longitude++) {
            triangles.push(
                0, longitude, longitude + 1,
                triangleCount - 1, triangleCount - longitude - 1, triangleCount - longitude - 2,
            )
        }
        let leftVertex;
        for(let latitude = 0; latitude < verticalSteps / 2 - 2; latitude++) {
            for(let longitude = 0; longitude < verticalSteps; longitude++) {
                leftVertex = latitude * (verticalSteps + 1) + longitude + 1;
                triangles.push(
                    leftVertex, leftVertex + verticalSteps + 1, leftVertex + verticalSteps + 2,
                    leftVertex, leftVertex + verticalSteps + 2, leftVertex + 1,
                )
            }
        }
        this.vertices = new Float32Array(vertices);
        this.normals = new Float32Array(normals);
        this.uvs = new Float32Array(uvs);
        this.triangles = new Uint16Array(triangles);
        this.center = position;
    }
}