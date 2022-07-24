import * as Formats from './formats.js';

const readings = [];

const domBuilder = (tagName, classAttr, ...content) => {
	const dom = document.createElement(tagName);
	dom.setAttribute('class', classAttr);
	for (let item of content) {
		if (typeof item === 'string') {
			dom.innerHTML += item;
		} else {
			dom.appendChild(item);
		}
	}
	return dom;
};

const stringifyTime = (time, zone) => {
	return time.toISOString();
};

const stringifyAngle = (angle) => Formats.stringify(angle);

const div = (...args) => domBuilder('div', ...args);
const field = (label, content) => div('info-line',
	div('info-label', label + ':'),
	document.createTextNode(' '),
	div('info-value', content),
);

export const addReading = ({ bodyName, time, zone, angle }) => {
	const reading = div('reading',
		div('body-name', bodyName),
		field('Time', stringifyTime(time, zone)),
		field(angle.type, stringifyAngle(angle.value)),
	);
	document.querySelector('#readings').appendChild(reading);
};

addReading({
	bodyName: 'Sun',
	time: new Date(),
	zone: '-03:00',
	angle: {
		type: 'Zenith',
		value: 23.1231,
	},
});
