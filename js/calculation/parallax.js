const radius = 6371e3;
const sin = (deg) => Math.sin(deg/180*Math.PI);
const asin = (val) => Math.asin(val)/Math.PI*180;

export const correctionFor = (alt, dist) => asin(sin(alt + 90)*radius/dist);
