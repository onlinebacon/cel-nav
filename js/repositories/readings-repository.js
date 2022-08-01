const readings = [];
const eventHandlers = {
    add: [],
    update: [],
    remove: [],
};
let lastId = 0;

export const add = ({ ...data }) => {
    const id = ++lastId;
    const reading = { id, ...data };
    readings.push(reading);
    eventHandlers.add.forEach(handler => handler({ ...reading }));
    return reading;
};

export const list = () => {
    const clone = readings.map(reading => ({ ...reading }));
    return clone;
};

export const get = (id) => {
    const reading = readings.find(reading => reading.id == id);
    if (reading === null) {
        return null;
    }
    return { ...reading };
};

export const remove = (id) => {
    const reading = readings.find(reading => reading.id == id);
    if (reading === null) {
        throw new Error(`Reading id=${id} not found`);
    }
    const index = readings.indexOf(reading);
    readings.splice(index, 1);
    eventHandlers.remove.forEach(handler => handler({ ...reading }));
};

export const update = ({ id, ...data }) => {
    const reading = readings.find(reading => reading.id == id);
    if (reading === null) {
        throw new Error(`Reading id=${id} not found`);
    }
    const index = readings.indexOf(reading);
    const newReading = { id, ...reading, ...data };
    readings[index] = newReading;
    eventHandlers.update.forEach(handler => handler({ ...newReading }));
};

export const on = (event, handler) => {
    if (event === 'add') {
        eventHandlers.add.push(handler);
    } else if (event === 'update') {
        eventHandlers.update.push(handler);
    } else if (event === 'remove') {
        eventHandlers.remove.push(handler);
    } else {
        throw new Error(`Unrecognized event ${event}`);
    }
};
