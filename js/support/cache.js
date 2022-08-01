const cacheMap = {};

export const get = (key, invoke) => {
    const promise = cacheMap[key];
    if (promise !== undefined) {
        return promise;
    }
    return cacheMap[key] = invoke();
};
