import * as Cache from '../support/cache.js';
import loadImage from '../support/load-image.js';
import { SmallCircleBuilder } from '../math/small-circles.js';

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const smallCircleColor = '#fff';
const smallCircles = [];
const points = [];

let projection;

const getImage = (url) => {
	return Cache.get(url, () => loadImage(url));
};

const project = ([ lat, lon ]) => {
	const [ nx, ny ] = projection.latlonToNormal(lat, lon);
	return [
		(nx + 1)*0.5*canvas.width,
		(1 - ny)*0.5*canvas.height,
	];
};

const drawPointList = (first) => {
	ctx.beginPath();
	ctx.moveTo(...first.point);
	let last = first;
	let item = first.next;
	const maxDx = canvas.width/2;
	const maxDy = canvas.height/2;
	for (;;) {
		const dx = Math.abs(item.point[0] - last.point[0]);
		const dy = Math.abs(item.point[1] - last.point[1]);
		if (dx > maxDx || dy > maxDy) {
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(...item.point);
		} else {
			ctx.lineTo(...item.point);
		}
		if (item === first) break;
		last = item;
		item = item.next;
	}
	ctx.stroke();
};

const drawSmallCircle = ([ lat, lon, rad ]) => {
	const n = 360;
	const builder = new SmallCircleBuilder(lat, lon, rad);
	let head = null;
	let foot = null;
	for (let i=0; i<n; ++i) {
		const angle = i/n*Math.PI*2;
		const point = project(builder.getPoint(angle));
		const item = { point, angle, last: null };
		if (head === null) {
			foot = head = item;
			item.next = item;
		} else {
			foot.next = item;
			item.next = head;
			foot = item;
		}
	}
	ctx.lineWidth = 1;
	ctx.strokeStyle = smallCircleColor;
	drawPointList(foot, head);
	const [ x, y ] = project([ lat, lon ]);
	ctx.fillStyle = '#fff';
	ctx.beginPath();
	ctx.arc(x, y, 2, 0, Math.PI*2);
	ctx.fill();
};

const drawPoint = (latlon) => {
	const [ x, y ] = project(latlon);
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

export const clear = () => {
	smallCircles.length = 0;
	points.length = 0;
};

export const addSmallCircle = (lat, lon, rad) => {
	smallCircles.push([ lat, lon, rad ]);
};

export const addPoint = (lat, lon, rad) => {
	points.push([ lat, lon, rad ]);
};
