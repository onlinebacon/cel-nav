import * as ReadingsRepo from '../repositories/readings-repository.js';
import * as Popup from '../web-controllers/popup.js'
import * as AngleTypes from '../lists/angle-types.js';
import * as AngleFormats from '../support/format/angle.js';
import * as HourAngleFormats from '../support/format/hour-angle.js';
import Bodies from '../lists/celestial-bodies.js';

const divReadings = document.querySelector('#readings');
const newButton = divReadings.querySelector('.new-button');
let lastTimeAdded = null;
let currentZone = - new Date().getTimezoneOffset()

const celestialBodyListHTML = [
	'Other',
	...Bodies.map(({ name }) => name),
].map((name, index) => {
	return `<option value=${name}${index == 1 ? ' selected' : ''}>${name}</option>`
}).join('\n');

const angleTypesHTML = AngleTypes.list.map(({ label, short }) => {
	return `<option value="${short}">${label}</option>`;
}).join('\n');

const stringifyTimezone = (zone) => {
	const sign = zone >= 0 ? '+' : '-';
	zone = Math.abs(zone);
	const min = zone % 60;
	const hr = Math.round((zone - min)/60);
	return sign + [ hr, min ].map(val => (val + '').padStart(2, '0')).join(':');
};

const getInput = (popup, name) => popup.querySelector(`[name="${name}"]`);

const parseZone = (zone) => {
	zone = zone;
	const neg = zone.startsWith('-');
	zone = zone.replace(/^[+\-]\s*/, '');
	const values = zone.split(/\s*:\s*/);
	if (values.length > 2) {
		return null;
	}
	if (values.find(val => !/^\d+$/.test(val))) {
		return null;
	}
	const hours = values
		.map((val, i) => val*Math.pow(60, -i))
		.reduce((a, b) => a + b, 0);
	return Math.round(hours*60)*(neg ? -1 : 1);
};

const setTime = (popup, time, zone) => {
	const zoneInput = popup.querySelector('[name="zone"]')
	const dateTimeInput = popup.querySelector('[name="datetime"]');
	const date = new Date(time*1 + zone*60*1000);
	zoneInput.value = stringifyTimezone(zone);
	dateTimeInput.value = date
		.toISOString()
		.replace(/[Z]/g, '\x20')
		.replace(/\.\d+/, '')
		.trim();
};

const initNowButton = (popup) => {
	const nowButton = popup.querySelector('.now');
	const zoneInput = popup.querySelector('[name="zone"]')
	zoneInput.value = stringifyTimezone(currentZone);
	nowButton.addEventListener('click', () => {
		setTime(popup, new Date(), parseZone(zoneInput.value));
	});
	setTime(popup, lastTimeAdded || new Date(), currentZone);
};

const getFormData = (popup) => Object.fromEntries(
	[ ...popup.querySelectorAll('[name]') ]
		.map(input => [ input.getAttribute('name'), input.value.trim() ])
);

const parseForm = (popup) => {
	const data = getFormData(popup);
	const zone = parseZone(data.zone);
	let angleType = data['angle-type'];
	let angle = AngleFormats.parse(data.angle);
	return {
		body: data.body,
		... (data.body.toLowerCase() === 'other' ? {
			ra: HourAngleFormats.parse(data.ra),
			dec: AngleFormats.parse(data.dec),
		} : {}),
		time: new Date(data.datetime + stringifyTimezone(zone)),
		zone,
		angle: { value: angle, type: angleType },
		height: angleType == AngleTypes.ELEVATION.short ? AngleFormats.parse(data.height || '0') : null,
		hUnit: data['height-unit'],
	};
};

const initAddButton = (popup) => {
	const submit = popup.querySelector('.submit');
	submit.addEventListener('click', () => {
		const valid = validateForm(popup);
		if (!valid) {
			return;
		}
		const reading = parseForm(popup);
		currentZone = reading.zone;
		lastTimeAdded = reading.time;
		Popup.close(popup);
		ReadingsRepo.add(reading);
	});
};

const getFieldDiv = (element) => {
	while (!element.matches('.field')) {
		element = element.parentElement;
	}
	return element;
};

const handleBodyUpdate = (popup) => {
	const raDecField = getFieldDiv(getInput(popup, 'ra'));
	const value = getInput(popup, 'body').value.toLowerCase();
	if (value === 'other') {
		raDecField.style.display = 'block';
	} else {
		raDecField.style.display = 'none';
	}
};

const initBodySelect = (popup) => {
	const bodySelect = getInput(popup, 'body');
	bodySelect.innerHTML = celestialBodyListHTML;
	bodySelect.addEventListener('input', () => handleBodyUpdate(popup));
};

const handleAngleTypeChange = (popup) => {
	const select = popup.querySelector('[name="angle-type"]');
	const heightField = getFieldDiv(popup.querySelector('[name="height"]'));
	const { value } = select;
	if (AngleTypes.ELEVATION.short === value) {
		heightField.style.display = 'block';
	} else {
		heightField.style.display = 'none';
	}
};

const initAngleTypeSelect = (popup) => {
	const select = getInput(popup, 'angle-type');
	select.innerHTML = angleTypesHTML;
	select.addEventListener('input', () => handleAngleTypeChange(popup));
};

const initDeleteButton = (popup, { id }) => {
	const button = popup.querySelector('.delete');
	button.addEventListener('click', () => {
		Popup.close(popup);
		ReadingsRepo.remove(id);
	});
};

const initUpdateButton = (popup, { id }) => {
	popup.querySelector('.submit').addEventListener('click', () => {
		if (!validateForm(popup)) {
			return;
		}
		const reading = { id, ...parseForm(popup) };
		Popup.close(popup);
		ReadingsRepo.update(reading);
	});
};

const initNewReadingForm = (popup) => {
	initAddButton(popup);
	popup.querySelector('.delete').remove();
	handleBodyUpdate(popup);
};

const initEditReadingForm = (popup, reading) => {
	popup.querySelector('.submit').value = 'Update';
	setTime(popup, reading.time, reading.zone);
	initDeleteButton(popup, reading);
	initUpdateButton(popup, reading);
	getInput(popup, 'angle').value = AngleFormats.stringify(reading.angle.value);
	getInput(popup, 'angle-type').value = reading.angle.type;
	getInput(popup, 'height').value = reading.height;
	getInput(popup, 'height-unit').value = reading.hUnit;
	getInput(popup, 'body').value = reading.body;
	if (reading.ra != null) {
		getInput(popup, 'ra').value = HourAngleFormats.stringify(reading.ra);
	}
	if (reading.dec != null) {
		getInput(popup, 'dec').value = AngleFormats.stringify(reading.dec);
	}
	handleBodyUpdate(popup);
	handleAngleTypeChange(popup);
};

const openReadingForm = async () => {
	const res = await fetch('forms/reading.html');
	const html = await res.text();
	const popup = Popup.open({ html });
	initNowButton(popup);
	initBodySelect(popup);
	initAngleTypeSelect(popup);
	return popup;
};

const openNewReadingForm = async () => {
	const popup = await openReadingForm();
	initNewReadingForm(popup);
};

const openEditReadingForm = async (id) => {
	const popup = await openReadingForm();
	const reading = ReadingsRepo.get(id);
	initEditReadingForm(popup, reading);
};

const validateForm = (popup) => {
	let data = getFormData(popup);
	let body = data.body.toLowerCase();
	let { ra, dec, angle } = data;
	if (body === 'other') {
		if (!ra) {
			alert('You need to input a right ascension');
			return false;
		}
		ra = HourAngleFormats.parse(ra);
		if (ra == null) {
			alert('Invalid right ascension format');
			return false
		}
		if (!dec) {
			alert('You need to input a declination');
			return false;
		}
		dec = AngleFormats.parse(dec);
		if (dec == null) {
			alert('Invalid declination format');
			return false
		}
	} else {
		ra = null;
		dec = null;
	}
	if (!angle) {
		alert('You need to input an angle');
		return false;
	}
	angle = AngleFormats.parse(angle);
	if (angle == null) {
		alert('Invalid angle format');
		return false;
	}
	return true;
};

const getReadingId = (element) => {
	while (element && !element.matches('[reading-id]')) {
		element = element.parentElement;
	}
	if (element) {
		return element.getAttribute('reading-id')*1;
	}
	return null;
};

newButton.addEventListener('click', openNewReadingForm);
divReadings.addEventListener('click', ({ target }) => {
	const id = getReadingId(target);
	if (id == null) {
		return;
	}
	openEditReadingForm(id);
});
