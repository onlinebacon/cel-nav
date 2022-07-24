import * as Popup from '../view/popup.js'
import * as AngleTypes from '../lists/angle-types.js';
import Bodies from '../lists/celestial-bodies.js';

const divReadings = document.querySelector('#readings');
const newButton = divReadings.querySelector('.new-button');

const getLocalTimezone = () => {
	return - new Date().getTimezoneOffset();
};

const celestialBodyListHTML = [
	'Other',
	...Bodies.map(({ name }) => name),
].map(name => {
	return `<option value=${name}>${name}</option>`
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

const parseZone = (zone) => {
	zone = zone.trim();
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

const initNowButton = (popup) => {
	const nowButton = popup.querySelector('.now');
	const zoneInput = popup.querySelector('[name="zone"]')
	const dateTimeInput = popup.querySelector('[name="datetime"]');
	zoneInput.value = stringifyTimezone(getLocalTimezone());
	nowButton.addEventListener('click', () => {
		const zone = parseZone(zoneInput.value);
		const now = new Date();
		const date = new Date(now*1 + zone*60*1000);
		dateTimeInput.value = date
			.toISOString()
			.replace(/[Z]/g, '\x20')
			.replace(/\.\d+/, '')
			.trim();
	});
};

const initSubmit = (popup) => {
	const submit = popup.querySelector('.submit');
	const inputs = [ ...popup.querySelectorAll('[name]') ];
	submit.addEventListener('click', () => {
		const data = Object.fromEntries(
			inputs.map(input => {
				const name = input.getAttribute('name');
				const value = input.value;
				return [ name, value ];
			}),
		);
		console.log(data);
	});
};

const getFieldDiv = (element) => {
	while (!element.matches('.field')) {
		element = element.parentElement;
	}
	return element;
};

const initBodySelect = (popup) => {
	const bodySelect = popup.querySelector('[name="body"]');
	const radecField = getFieldDiv(popup.querySelector('[name="ra"]'));
	bodySelect.innerHTML = celestialBodyListHTML;
	bodySelect.oninput = () => {
		const value = bodySelect.value;
		if (value.toLowerCase() === 'other') {
			radecField.style.display = 'block';
		} else {
			radecField.style.display = 'none';
		}
	};
};

const initAngleTypeSelect = (popup) => {
	const select = popup.querySelector('[name="angle-type"]');
	select.innerHTML = angleTypesHTML;
};

const initNewReadingForm = (popup) => {
	initNowButton(popup);
	initSubmit(popup);
	initBodySelect(popup);
	initAngleTypeSelect(popup);
};

newButton.addEventListener('click', async () => {
	const res = await fetch('forms/reading.html');
	const html = await res.text();
	const popup = Popup.open({ html });
	popup.querySelector('.delete').remove();
	initNewReadingForm(popup);
});
