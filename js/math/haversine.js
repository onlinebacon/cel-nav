const { sin, cos, asin, sqrt } = Math;

const haversine = (aLat, aLon, bLat, bLon) => {
    const ax = sin(aLon)*cos(aLat);
    const ay = sin(aLat);
    const az = cos(aLon)*cos(aLat);
    const bx = sin(bLon)*cos(bLat);
    const by = sin(bLat);
    const bz = cos(bLon)*cos(bLat);
    const dx = bx - ax;
    const dy = by - ay;
    const dz = bz - az;
    const chord = sqrt(dx*dx + dy*dy + dz*dz);
    const theta = asin(chord*0.5);
    return theta*2;
};

export default haversine;
