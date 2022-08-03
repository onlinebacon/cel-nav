const baseUrl = 'http://skilltrek.com:8080';

export const fetchData = async (name, time) => {
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
};
