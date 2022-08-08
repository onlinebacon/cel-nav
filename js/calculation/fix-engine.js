import * as Readings from '../repositories/readings-repository.js';
import * as Log from '../web-controllers/calculation-log.js';
import * as Skyfield from '../data-sources/skyfield.js';
import * as Plotter from '../canvas/2d-plotter.js';
import * as AngleTypes from '../lists/angle-types.js';
import * as HourAngleFormats from '../support/format/hour-angle.js';
import * as AngleFormats from '../support/format/angle.js';
import * as Refraction from './refraction.js';
import * as Dip from './dip.js';
import * as Parallax from './parallax.js';
import calcAriesGHA from './calc-aries-gha.js';
import { getIntersections } from '../math/small-circles.js';

class InterruptedThreadError extends Error {}

const toRad = (deg) => deg/180*Math.PI;
const toDeg = (rad) => rad*180/Math.PI;
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

const fetchRaDecDist = async ({ time, body, ra, dec }) => {
    if (ra != null) {
        Log.writeln(`Using Ra/Dec provided: ${stringifyRaDec(ra, dec)}`);
        return { ra, dec, dist: null };
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

    const { ra, dec, dist } = await preventDoubleThread(fetchRaDecDist(reading));
    let lon = getLongitudeInsideLimits(ra/24*360 - ariesGHA);
    let lat = dec;
    Log.writeln(`GP for ${reading.body} is ${stringifyGP(lat, lon)}`);

    let { angle } = reading;
    let val = angle.value;
    let rad;

    if (angle.type === AngleTypes.ELEVATION.short) {
        if (reading.height) {
            const dip = Dip.of(reading.height, reading.hUnit);
            Log.writeln(`Dip correction: ${AngleFormats.stringify(dip)}`);
            val -= dip;
        }
        const ref = Refraction.forAlt(val);
        Log.writeln(`Refracted amount: ${AngleFormats.stringify(ref)}`);
        val -= ref;
        if (dist != null) {
            const parallax = Parallax.correctionFor(val, dist*1e3);
            if (parallax >= 1/60) {
                Log.writeln('Parallax correction: ' + AngleFormats.stringify(parallax));
                val += parallax;
            }
        }
        rad = 90 - val;
    }

    const circle = [ lat, lon, rad ].map(toRad);
    Log.writeln(`Circle radius: ${AngleFormats.stringify(rad)}`);
    
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
    const intersections = [];
    for (let i=1; i<smallCircles.length; ++i) {
        const a = smallCircles[i];
        for (let j=0; j<i; ++j) {
            const b = smallCircles[j];
            intersections.push(...getIntersections(a, b));
        }
    }
    if (intersections.length) {
        Log.writeln('');
        Log.writeln('Intersections:');
        for (let intersection of intersections) {
            Log.writeln(`${stringifyGP(...intersection.map(toDeg))}`);
            Plotter.addPoint(...intersection);
        }
    }
    Plotter.update();
};
