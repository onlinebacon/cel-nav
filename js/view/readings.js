import * as AngleFormats from '../support/angle-formats.js';
import * as ReadingsRepo from '../repositories/readings-repository.js';
import { div } from '../support/dom-factory.js';

const readings = [];

const stringifyTime = (time, zone) => {
	return time.toISOString().replace('T', '\x20').replace(/\.\d+Z/, '\x20UTC');
};

const stringifyAngle = (angle) => AngleFormats.stringify(angle);

const field = (label, content) => div('info-line',
	div('info-label', label + ':'),
	document.createTextNode(' '),
	div('info-value', content),
);

const addReading = ({ id, body, time, zone, angle }) => {
	const reading = div('reading',
		div('body-name', body),
		field('Time', stringifyTime(time, zone)),
		field(angle.type, stringifyAngle(angle.value)),
	);
	reading.setAttribute('reading-id', id);
	document.querySelector('#readings').appendChild(reading);
};

ReadingsRepo.on('add', addReading);
