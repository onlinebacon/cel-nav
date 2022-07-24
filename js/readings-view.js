import * as AngleFormats from './support/angle-formats.js';
import * as ReadingsRepo from './readings-repository.js';
import { div } from './support/dom-factory.js';

const readings = [];

const stringifyTime = (time, zone) => {
	return time.toISOString();
};

const stringifyAngle = (angle) => AngleFormats.stringify(angle);

const field = (label, content) => div('info-line',
	div('info-label', label + ':'),
	document.createTextNode(' '),
	div('info-value', content),
);

const addReading = ({ bodyName, time, zone, angle }) => {
	const reading = div('reading',
		div('body-name', bodyName),
		field('Time', stringifyTime(time, zone)),
		field(angle.type, stringifyAngle(angle.value)),
	);
	document.querySelector('#readings').appendChild(reading);
};

ReadingsRepo.on('add', addReading);
