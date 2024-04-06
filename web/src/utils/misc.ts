

export const deepCopy = (obj: any): any => {
    return JSON.parse(JSON.stringify(obj));
}

export function randomID(): number {
    return Math.floor(Math.random() * 10000000000);
}

export function isObjectEmpty(obj: Object) {
    if (obj === null || obj === undefined) return true;
    return Object.keys(obj).length === 0;
}