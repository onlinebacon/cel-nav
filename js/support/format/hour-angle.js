import Format from './format.js';

const formats = [
	new Format({
		example: '13h52m30.5s',
		regex: /\d\d?(\s*h\s*|\s)\d\d?(\s*m\s*|\s)(\d\d(\.\d+(\s*s\s*)?)?)?/,
		parse: (text) => {
			const [ h, m = 0, s = 0 ] = text
				.split(/^\s*[hms]\s*/)
				.map(Number);
			return h + m/60 + s/(60*60);
		},
		stringify: value => {
			let h = Math.floor(value);
			value = (value - h)*60;
			let m = Math.floor(value);
			value = (value - m)*60;
			let s = value;
			return `${
				h.toString().padStart(2, '0')
			}h${
				m.toString().padStart(2, '0')
			}m${
				s.toFixed(1).padStart(4, '0').replace(/\.?0+$/, '')
			}s`;
		},
	}),
	new Format({
		example: '25.45',
		regex: /^-?\d+(\.\d+)?(\s*°)?$/,
		parse: Number,
		stringify: value => value,
	}),
];

export const parse = (value) => {
	const format = formats.find(format => format.regex.test(value));
	return format.parse(value);
};

export const stringify = (value) => {
	return formats[0].stringify(value);
};
