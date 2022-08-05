import * as AngleFormats from '../support/format/angle.js';
import * as ReadingsRepo from '../repositories/readings-repository.js';
import { div } from '../support/dom-factory.js';

const stringifyTime = (time, zone) => {
	return time.toISOString().replace('T', '\x20').replace(/\.\d+Z/, '\x20UTC');
};

const stringifyAngle = (angle) => AngleFormats.stringify(angle);

const field = (label, content) => div('info-line',
	div('info-label', label + ':'),
	document.createTextNode(' '),
	div('info-value', content),
);

const addReading = ({ id, body, time, zone, angle, height, hUnit }) => {
	const content = [
		div('body-name', body),
		field('Time', stringifyTime(time, zone)),
		field(angle.type, stringifyAngle(angle.value)),
	];
	if (height != null) {
		content.push(field('Height', Number(height) + ' ' + hUnit));
	}
	const reading = div('reading', ...content);
	reading.setAttribute('reading-id', id);
	document.querySelector('#readings').appendChild(reading);
};

const removeReading = ({ id }) => {
	document.querySelector(`[reading-id="${id}"]`).remove();
};

ReadingsRepo.on('add', addReading);
ReadingsRepo.on('remove', removeReading);
