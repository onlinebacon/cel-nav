import { mulVec3Mat3 } from './mat3-math.js';
import { vecToLatlon, buildLatlonMat3 } from './euclidian-latlon.js';

export class SmallCircleBuilder {
	constructor(lat, lon, rad) {
		this.z = Math.cos(rad);
		this.r = Math.sin(rad);
		this.mat3 = buildLatlonMat3(lat, lon);
	};
	getPoint(angle) {
		const { z, r, mat3 } = this;
		const vec = mulVec3Mat3([ Math.sin(angle)*r, Math.cos(angle)*r, z ], mat3);
		return vecToLatlon(vec);
	}
}

const intersectionExists = ([ aLat, alon, aRad ], [ bLat, blon, bRad ]) => {
    return true;
};

const getIntersections = ([ aLat, alon, aRad ], [ bLat, blon, bRad ]) => {
    
};