import { mulVec3Mat3 } from './mat3-math.js';

import {
	vecToLatlon,
	buildLatlonMat3,
} from './euclidian-latlon.js';

export class SmallCircleBuilder {
	constructor(lat, lon, rad) {
		this.z = Math.cos(rad);
		this.r = Math.sin(rad);
		this.mat3 = buildLatlonMat3([ lat, lon ]);
	};
	getPoint(angle) {
		const { z, r, mat3 } = this;
		const vec = mulVec3Mat3([ Math.sin(angle)*r, Math.cos(angle)*r, z ], mat3);
		return vecToLatlon(vec);
	}
}

const { cos, sin, acos, asin, sqrt } = Math;

const final = (x, y, z, az, lat, lon) => {
	[ x, y ] = [
		x*cos(az) + y*sin(az),
		x*-sin(az) + y*cos(az),
	];
	[ y, z ] = [
		y*cos(lat) + z*sin(lat),
		y*-sin(lat) + z*cos(lat),
	];
	[ x, z ] = [
		x*cos(lon) + z*sin(lon),
		x*-sin(lon) + z*cos(lon),
	];
	return [
		asin(y),
		acos(z/sqrt(x*x + z*z))*(x < 0 ? -1 : 1),
	];
};

export const getIntersections = ([ aLat, aLon, aRad ], [ bLat, bLon, bRad ]) => {
	let [ x, y, z ] = [
		sin(bLon)*cos(bLat),
		sin(bLat),
		cos(bLon)*cos(bLat),
	];
	[ x, z ] = [
		x*cos(aLon) - z*sin(aLon),
		x*sin(aLon) + z*cos(aLon),
	];
	[ y, z ] = [
		y*cos(aLat) - z*sin(aLat),
		y*sin(aLat) + z*cos(aLat),
	];
	let az = acos(y/sqrt(x*x + y*y))*(x < 0 ? -1 : 1);
	y = x*sin(az) + y*cos(az);
	let py = y*cos(bRad);
	let pz = z*cos(bRad);
	let m = -z/y;
	let c = py - pz*m;
	let iz = cos(aRad);
	let iy = iz*m + c;
	let ix = sqrt(1 - iz*iz - iy*iy);
	return [
		final(ix, iy, iz, az, aLat, aLon),
		final(-ix, iy, iz, az, aLat, aLon),
	];
};
