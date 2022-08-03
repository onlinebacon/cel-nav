import * as Readings from '../repositories/readings-repository.js';
import * as Log from '../web-controllers/calculation-log.js';
import * as Skyfield from '../data-sources/skyfield.js';
import calcAriesGHA from './calc-aries-gha.js';

const fetchRaDec = async ({ time, body, ra, dec }) => {
    if (ra != null) {
        Log.writeln(`Using Ra/Dec provided for ${body}`);
        return { ra, dec };
    }
    const data = await Skyfield.fetchData(body, time);
    Log.writeln(`Ra/Dec found for ${body} was: ${data.ra}/${data.dec}`);
    return data;
};

const getLongitudeInsideLimits = (longitude) => {
    return (longitude % 360 + 360 + 180) % 360 - 180;
};

export const run = async () => {
    const readings = Readings.list();
    for (let i=0; i<readings.length; ++i) {
        Log.writeln(`Running reading number ${i + 1}`);
        const reading = readings[i];
        const ariesGHA = calcAriesGHA(reading.time);
        Log.writeln(`GHA of aries: ${ariesGHA}`);
        const { ra, dec } = await fetchRaDec(reading);
        let longitude = getLongitudeInsideLimits(ra/24*360 - ariesGHA);
        let latitude = dec;
        Log.writeln(`GP for ${reading.body} is ${latitude}, ${longitude}`);
    }
};
