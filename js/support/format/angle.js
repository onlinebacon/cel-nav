import Format from './format.js';

const formats = [
	new Format({
		example: '25.45°',
		regex: /^-?\d+(\.\d+)?(\s*°)?$/,
		parse: Number,
		stringify: value => value + '°',
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
