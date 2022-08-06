import * as AngleFormats from '../support/format/angle.js';
import * as ReadingsRepo from '../repositories/readings-repository.js';
import { div } from '../support/dom-factory.js';

const stringifyZone = (zone) => {
	const sign = zone < 0 ? '-' : '+';
	zone = Math.abs(zone);
	const m = zone%60 + '';
	const h = Math.floor((zone - m)/60) + '';
	return `${sign}${h.padStart(2, '0')}:${h.padStart(2, '0')}`;
};

const stringifyTime = (time, zone) => {
	if (zone == 0) {
		return time
			.toISOString()
			.replace(/T/, ' ')
			.replace(/\..*/, ' UTC');
	}
	return new Date(time*1 + zone*60*1000)
		.toISOString()
		.replace(/T/, ' ')
		.replace(/\..*/, ' GMT' + stringifyZone(zone));
};

const stringifyAngle = (angle) => AngleFormats.stringify(angle);

const field = (label, content) => div('info-line',
	div('info-label', label + ':'),
	document.createTextNode(' '),
	div('info-value', content),
);

const createReadingDOM = ({ id, body, time, zone, angle, height, hUnit }) => {
	const content = [
		div('body-name', body),
		field('Time', stringifyTime(time, zone)),
		field(angle.type, stringifyAngle(angle.value)),
	];
	if (height != null) {
		content.push(field('Height', Number(height) + ' ' + hUnit));
	}
	const dom = div('reading', ...content);
	dom.setAttribute('reading-id', id);
	return dom;
};

const addReading = (reading) => {
	const dom = createReadingDOM(reading);
	document.querySelector('#readings').appendChild(dom);
};

const updateReading = (reading) => {
	const dom = createReadingDOM(reading);
	const old = document.querySelector(`[reading-id="${reading.id}"]`);
	old.parentElement.insertBefore(dom, old);
	old.remove();
};

const removeReading = ({ id }) => {
	document.querySelector(`[reading-id="${id}"]`).remove();
};

ReadingsRepo.on('add', addReading);
ReadingsRepo.on('update', updateReading);
ReadingsRepo.on('remove', removeReading);
