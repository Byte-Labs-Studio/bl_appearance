//https://github.com/overextended/ox_lib/blob/master/package/server/resource/callback/index.ts

const resourceName = GetCurrentResourceName()

const activeEvents = {};
onNet(`__ox_cb_${resourceName}`, (key, ...args) => {
    const resolve = activeEvents[key];
    return resolve && resolve(...args);
});

export function triggerClientCallback(eventName: string, playerId: string, ...args: any[]) {
    let key: string;
    do {
        key = `${eventName}:${Math.floor(Math.random() * (100000 + 1))}:${playerId}`;
    } while (activeEvents[key]);
    emitNet(`__ox_cb_${eventName}`, playerId, resourceName, key, ...args);
    return new Promise((resolve) => {
        activeEvents[key] = resolve;
    });
}

export function onClientCallback(eventName: string, cb: (playerId: number, ...args: any[]) => any) {
    onNet(`__ox_cb_${eventName}`, async (resource: string, key: string, ...args: any[]) => {
        const src = source;
        let response: any;

        try {
            response = await cb(src, ...args);
        } catch (e: any) {
            console.error(`an error occurred while handling callback event ${eventName} | Error: `, e.message);
        }

        emitNet(`__ox_cb_${resource}`, src, key, response);
    });
}

export const core = exports.bl_bridge.core()
