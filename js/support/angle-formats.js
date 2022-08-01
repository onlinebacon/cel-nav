class Format {
	constructor({
		example,
		regex,
		parse,
		stringify,
	}) {
		this.example = example;
		this.regex = regex;
		this.parse = parse;
		this.stringify = stringify;
	}
}

const degreesFormats = [
	new Format({
		example: '25.45°',
		regex: /^-?\d+(\.\d+)?(\s*°)?$/,
		parse: Number,
		stringify: value => value + '°',
	}),
];

const hourAngleFormat = new Format({
	example: '13h52m30.5s',
	regex: /\d\d?(\s*h\s*|\s)\d\d?(\s*m\s*|\s)(\d\d(\.\d+(\s*s\s*)?)?)?/,
	parse: Number,
	stringify: value => {
		value = value/360*24;
		value = (value%24 + 24)%24;
		value *= 3600;
		let s = value % 60;
		value = Math.round((value - s)/60);
		let m = value;
		let h = Math.round((value - m)/60);
		return `${
			h.toString().padStart(2, '0')
		}h${
			m.toString().padStart(2, '0')
		}m${
			s.toFixed(1).padStart(4, '0').replace(/\.?0+$/, '')
		}s`;
	},
});

export const formats = [
	... degreesFormats,
];

let [ defaultFormat ] = formats;

export const setDefaultFormat = format => {
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

export const stringifyHourAngle = (value) => {
	return hourAngleFormat.stringify(value);
};
