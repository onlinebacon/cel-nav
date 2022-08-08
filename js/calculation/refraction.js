const cot = angle => 1/Math.tan(angle*(Math.PI/180));
export const forAlt = (h) => cot(h + 7.31/(h + 4.4))/60;
export const forZenith = (z) => - forAlt(90 - z);
