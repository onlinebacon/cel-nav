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

export const formats = [
    new Format({
        example: '-25.45',
        regex: /^-?\d+(\.\d+)?(\s*°)?$/,
        parse: Number,
        stringify: value => value + '°',
    }),
];

let [ defaultFormat ] = formats;

export const setDefaultFormat = format => {
    defaultFormat = format;
};

export const parse = (string) => {
    const format = formats.find(format => format.regex.test(string));
    return format.parse(string);
};

export const stringify = (value) => {
    return defaultFormat.stringify(value);
};
