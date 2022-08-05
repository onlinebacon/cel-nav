export default class Format {
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
