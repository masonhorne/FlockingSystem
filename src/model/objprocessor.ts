import { vec3 } from 'gl-matrix';

export type ObjModelParams = {
    vertices: Float32Array;
    normals: Float32Array;
    uvs: Float32Array;
    triangles: Uint16Array;
    center: vec3;
    bounds: { min: vec3; max: vec3 };
};

export class ObjProcessor {
    static processObj(objText: string): ObjModelParams {
        const lines = objText.split('\n');
        const positionsRaw: number[][] = [];
        const normalsRaw: number[][] = [];
        const uvsRaw: number[][] = [];
        const positions: number[] = [];
        const normals: number[] = [];
        const uvs: number[] = [];
        const indices: number[] = [];
        const uniqueVertexMap = new Map<string, number>();
        let nextIndex = 0;
        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
        // First pass: Read vertices, normals, uvs
        lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            switch (parts[0]) {
                case 'v': 
                    const x = parseFloat(parts[1]);
                    const y = parseFloat(parts[2]);
                    const z = parseFloat(parts[3]);
                    // Apply 90-degree CW rotation around X-axis
                    const rotatedY = z;
                    const rotatedZ = -y;
                    positionsRaw.push([x, rotatedY, rotatedZ]);
                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);
                    minY = Math.min(minY, rotatedY);
                    maxY = Math.max(maxY, rotatedY);
                    minZ = Math.min(minZ, rotatedZ);
                    maxZ = Math.max(maxZ, rotatedZ);
                    break;
                case 'vn': 
                    // Apply 90-degree CW rotation around X-axis
                    normalsRaw.push([parseFloat(parts[1]), parseFloat(parts[3]), -parseFloat(parts[2])]);
                    break;
                case 'vt':
                    uvsRaw.push([parseFloat(parts[1]), parseFloat(parts[2])]);
                    break;
            }
        });
        // Second pass: Read faces
        lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            if (parts[0] === 'f') {
                const vertexCount = parts.length - 1;
                for (let i = 1; i <= vertexCount - 2; i++) {
                    const indicesToProcess = [1, i + 1, i + 2];
                    indicesToProcess.forEach(faceIdx => {
                        const partsSplit = parts[faceIdx].split('/');
                        const vertexIndex = parseInt(partsSplit[0]) - 1;
                        const uvIndex = partsSplit[1] ? parseInt(partsSplit[1]) - 1 : -1;
                        const normalIndex = partsSplit[2] ? parseInt(partsSplit[2]) - 1 : -1;
                        const key = `${vertexIndex}/${uvIndex}/${normalIndex}`;
                        if (!uniqueVertexMap.has(key)) {
                            const pos = positionsRaw[vertexIndex];
                            positions.push(...pos);
                            if (uvIndex >= 0 && uvsRaw[uvIndex]) uvs.push(...uvsRaw[uvIndex]);
                            else uvs.push(0, 0);
                            if (normalIndex >= 0 && normalsRaw[normalIndex]) normals.push(...normalsRaw[normalIndex]);
                            else normals.push(0, 0, 0);
                            uniqueVertexMap.set(key, nextIndex);
                            indices.push(nextIndex);
                            nextIndex++;
                        } else {
                            indices.push(uniqueVertexMap.get(key)!);
                        }
                    });
                }
            }
        });
        const centerVec: vec3 = vec3.create();
        for (let i = 0; i < positions.length; i += 3) {
            vec3.add(centerVec, centerVec, vec3.fromValues(positions[i], positions[i + 1], positions[i + 2]));
        }
        vec3.scale(centerVec, centerVec, 1 / (positions.length / 3));
        return {
            vertices: new Float32Array(positions),
            normals: new Float32Array(normals),
            uvs: new Float32Array(uvs),
            triangles: new Uint16Array(indices),
            center: centerVec,
            bounds: { min: vec3.fromValues(minX, minY, minZ), max: vec3.fromValues(maxX, maxY, maxZ) }
        };
    }
}
