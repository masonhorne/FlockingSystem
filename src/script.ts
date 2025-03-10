import { mat4 } from 'gl-matrix';

const matrix = mat4.create();
console.log("Initial matrix", matrix);

mat4.identity(matrix);
console.log("Identity matrix", matrix);