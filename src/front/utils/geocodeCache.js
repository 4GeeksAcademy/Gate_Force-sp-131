// Module-level cache shared between LocationCell instances
const cache = {};

const toKey = (lat, lng) => `${Number(lat).toFixed(4)},${Number(lng).toFixed(4)}`;

export const getCached = (lat, lng) => cache[toKey(lat, lng)] ?? null;

export const setCached = (lat, lng, address) => {
    cache[toKey(lat, lng)] = address;
};

export const clearEntry = (lat, lng) => {
    delete cache[toKey(lat, lng)];
};
