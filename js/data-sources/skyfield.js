import * as Cache from '../support/cache.js';

const baseUrl = ''; /*
const baseUrl = 'https://skilltrek.com'; // */

export const fetchData = (name, time) => Cache.get(
    `skyfield:${name}:${time.toISOString()}`,
    async () => {
        const [ yr, mon, day, hr, min, sec ] = time.toISOString().split(/[^\d]/).map(Number);
        const utctime = { yr, mon, day, hr, min, sec };
        const payload = { name, utctime };
        const res = await fetch(baseUrl + '/radec', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'content-type': 'application/json' },
        });
        if (!res.ok) {
            throw new Error(`HTTP error ${res.status} requesting skyfield`);
        }
        const json = await res.text();
        const data = JSON.parse(json);
        return data;
    },
);
