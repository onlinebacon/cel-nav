import * as Cache from '../support/cache.js';
import loadImage from '../support/load-image.js';

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

const smallCircles = [
	[ 0, 0, Math.PI/8 ],
	[ Math.PI/4, Math.PI/4, Math.PI/8 ],
];
const points = [];
let projection;

const getImage = (url) => Cache.get(url, () => loadImage(url));

const vecToLatlon = ([ x, y, z ]) => {
	const lat = Math.asin(y);
	const yLen = Math.sqrt(x*x + z*z);
	if (yLen === 0) {
		return [ lat, 0 ];
	}
	return [ lat, Math.acos(z/yLen)*(x < 0 ? -1: 1) ];
};

const applyLatlon = ([ x, y, z ], lat, lon) => {
	const sinLat = Math.sin(lat);
	const cosLat = Math.cos(lat);
	const sinLon = Math.sin(lon);
	const cosLon = Math.cos(lon);
	const [ x0, y0, z0 ] = [ x, y, z ];
	const [ x1, y1, z1 ] = [
		x0,
		y0*cosLat + z0*sinLat,
		z0*cosLat - y0*sinLat,
	];
	const [ x2, y2, z2 ] = [
		x1*cosLon + z1*sinLon,
		y1,
		z1*cosLon - x1*sinLon,
	];
	return [ x2, y2, z2 ];
};

const buildLatlonTransform = (lat, lon) => {
	const sinLat = Math.sin(lat);
	const cosLat = Math.cos(lat);
	const sinLon = Math.sin(lon);
	const cosLon = Math.cos(lon);
	return [
		        cosLon,      0,        -sinLon,
		-sinLat*sinLon, cosLat, -sinLat*cosLon,
		 cosLat*sinLon, sinLat,  cosLat*cosLon,
	];
};

const applyTransform = (
	[ x, y, z ],
	[ ix, iy, iz, jx, jy, jz, kx, ky, kz ],
) => [
	x*ix + y*jx + z*kx,
	x*iy + y*jy + z*ky,
	x*iz + y*jz + z*kz,
];

const drawSmallCircle = ([ lat, lon, rad ]) => {
	const n = 20;
	const z = Math.cos(rad);
	const r = Math.sin(rad);
	const mat3 = buildLatlonTransform(lat, lon);
	for (let i=0; i<n; ++i) {
		const angle = i/n*Math.PI*2;
		const x = Math.sin(angle)*r;
		const y = Math.cos(angle)*r;
		const vec = applyTransform([ x, y, z ], mat3);
		const latlon = vecToLatlon(vec);
	}
};

const drawPoint = ([ lat, lon ]) => {
	let [ nx, ny ] = projection.latlonToNormal(lat, lon);
	let x = (0.5 + nx*0.5)*canvas.width;
	let y = (0.5 - ny*0.5)*canvas.height;
	ctx.fillStyle = '#fc0';
	ctx.beginPath();
	ctx.arc(x, y, 2, 0, Math.PI*2);
	ctx.fill();
};

export const setProjection = arg => {
	projection = arg;
};

export const update = async () => {
	const img = await getImage(projection.imageUrl);
	ctx.fillStyle = '#445';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.globalAlpha = 0.3;
	ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
	ctx.globalAlpha = 1;
	smallCircles.forEach(drawSmallCircle);
	points.forEach(drawPoint);
};

export const getCanvas = () => {
	return canvas;
};

export const resize = ({ width, height }) => {
	canvas.width = width;
	canvas.height = height;
};

export const addPoint = (lat, lon) => {
	points.push([ lat, lon ]);
};
