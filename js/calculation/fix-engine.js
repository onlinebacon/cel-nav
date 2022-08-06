import * as Readings from '../repositories/readings-repository.js';
import * as Log from '../web-controllers/calculation-log.js';
import * as Skyfield from '../data-sources/skyfield.js';
import * as Plotter from '../canvas/2d-plotter.js';
import * as AngleTypes from '../lists/angle-types.js';
import * as HourAngleFormats from '../support/format/hour-angle.js';
import * as AngleFormats from '../support/format/angle.js';
import calcAriesGHA from './calc-aries-gha.js';
import { getIntersections } from '../math/small-circles.js';

class InterruptedThreadError extends Error {}

const toRad = (deg) => deg/180*Math.PI;
const smallCircles = [];

let fixId = 0;

const clear = () => {
    smallCircles.length = 0;
    Log.clear();
    Plotter.clear();
};

const preventDoubleThread = async (promise) => {
    const id = fixId;
    const res = await promise;
    if (id !== fixId) {
        throw new InterruptedThreadError();
    }
    return res;
};

const stringifyRaDec = (ra, dec) => `${
    HourAngleFormats.stringify(ra)
} / ${
    AngleFormats.stringify(dec)
}`;

const fetchRaDec = async ({ time, body, ra, dec }) => {
    if (ra != null) {
        Log.writeln(`Using Ra/Dec provided: ${stringifyRaDec(ra, dec)}`);
        return { ra, dec };
    }
    const data = await preventDoubleThread(Skyfield.fetchData(body, time));
    Log.writeln(`Ra/Dec found: ${stringifyRaDec(data.ra, data.dec)}`);
    return data;
};

const getLongitudeInsideLimits = (lon) => {
    return (lon % 360 + 360 + 180) % 360 - 180;
};

const stringifyGP = (lat, lon) => {
    const latSign = lat < 0 ? 'S' : 'N';
    const lonSign = lon < 0 ? 'W' : 'E';
    [ lat, lon ] = [ lat, lon ].map(val => {
        return AngleFormats.stringify(Math.abs(val));
    });
    return `${lat} ${latSign}, ${lon} ${lonSign}`;
};

const calcReading = async (reading) => {
    const ariesGHA = calcAriesGHA(reading.time);
    Log.writeln(`GHA of aries: ${AngleFormats.stringify(ariesGHA)}`);

    const { ra, dec } = await preventDoubleThread(fetchRaDec(reading));
    let lon = getLongitudeInsideLimits(ra/24*360 - ariesGHA);
    let lat = dec;
    Log.writeln(`GP for ${reading.body} is ${stringifyGP(lat, lon)}`);

    let { angle } = reading;
    let rad = null;
    switch (angle.type) {
        case AngleTypes.ELEVATION.short:
            rad = 90 - angle.value;
        break;
    }

    const circle = [ lat, lon, rad ].map(toRad);
    Log.writeln(`Circle radius: ${rad}`);
    
    for (let smallCircle of smallCircles) {
        const intersections = getIntersections(smallCircle, circle);
        intersections.forEach(point => Plotter.addPoint(...point));
    }
    smallCircles.push(circle);
    Plotter.addSmallCircle(...circle, reading.body);
};

export const run = async () => {
    ++ fixId;
    clear();
    const readings = Readings.list();
    try {
        for (let i=0; i<readings.length; ++i) {
            if (i != 0) {
                Log.writeln('');
            }
            const reading = readings[i];
            const { body } = reading;
            const prefix = /^(sun|moon)$/i.test(body) ? 'the ' : '';
            Log.writeln(`Running reading of ${prefix + body}`);
            await preventDoubleThread(calcReading(reading));
        }
    } catch(error) {
        if (!(error instanceof InterruptedThreadError)) {
            throw error;
        }
    }
    Plotter.update();
};
