const SIDEREAL_DAY_MS = 86164090.53820801;
const NULL_ARIES_GHA_TIME = 1656652979900;
const MS_TO_DEGREES = 360 / SIDEREAL_DAY_MS;

const calcAriesGHA = (date) => {
	const angle = (date - NULL_ARIES_GHA_TIME) * MS_TO_DEGREES;
	return (angle % 360 + 360) % 360;
};

export default calcAriesGHA;
