export class BodyNotFoundError extends Error {
    constructor(bodyName, sourceName) {
        super(`Celestial body ${
            JSON.stringify(bodyName)
        } was not found at ${
            JSON.stringify(sourceName)
        }`);
    }
}

export class RaDecSource {
    constructor(name) {
        this.name = name;
    }
    async lookup(bodyName) {
        throw new BodyNotFound(bodyName, this.name);
    }
    async list() {
        return [];
    }
}
