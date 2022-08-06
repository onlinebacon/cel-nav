import Format from './format.js';

const formats = [
	new Format({
		example: `25°27.2'`,
		regex: /^([+\-]\s*)?\d+(\s*°\s*|\s+)\d+(\.\d+)?(\s*')?$/,
		parse: (value) => {
			const sign = value.startsWith('-') ? -1 : 1;
			value = value.replace(/[+\-]\s*/, '');
			const [ d, m ] = value.split(/[\s°']+/).map(Number);
			return (d + m/60)*sign;
		},
		stringify: (value) => {
			const prefix = value < 0 ? '-' : '';
			value = Math.abs(value);
			value = Math.round(value*600)*0.1;
			const m = value%60;
			const d = Math.round((value - m)/60);
			return `${prefix}${d}°${m.toFixed(1)*1}'`;
		},
	}),
	new Format({
		example: '25.45°',
		regex: /^(-\s*)?\d+(\.\d+)?(\s*°)?$/,
		parse: val => Number(val.replace(/[°\s]/g, '')),
		stringify: (value) => value.toFixed(3)*1 + '°',
	}),
];

let [ defaultFormat ] = formats;

export const setDefaultFormat = (sample) => {
	const format = formats.find(format => format.regex.test(sample));
	if (!format) {
		throw new Error('No format found for ' + JSON.stringify(sample));
	}
	defaultFormat = format;
};

export const parse = (string) => {
	const format = formats.find(format => format.regex.test(string));
	if (!format) {
		return null;
	}
	return format.parse(string);
};

export const stringify = (value) => {
	return defaultFormat.stringify(value);
};

export const list = () => {
	return formats.map(format => ({ ...format }));
};
