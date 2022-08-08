const acos = value => Math.acos(value)/Math.PI*180;
const radius = 6371e3;
const R = 7/6 * radius;
const unitScale = {
	'm': 1,
	'ft': 0.3048,
};
export const of = (h, unit = 'm') => {
	const m = unitScale[unit]*h;
	return acos(R/(R+m));
};
