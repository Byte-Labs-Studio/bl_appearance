//https://github.com/overextended/ox_lib/blob/master/package/server/resource/callback/index.ts

const resourceName = GetCurrentResourceName()

const activeEvents = {};
onNet(`_bl_cb_${resourceName}`, (key, ...args) => {
    const resolve = activeEvents[key];
    return resolve && resolve(...args);
});

export function triggerClientCallback(eventName: string, playerId: string, ...args: any[]) {
    let key: string;
    do {
        key = `${eventName}:${Math.floor(Math.random() * (100000 + 1))}:${playerId}`;
    } while (activeEvents[key]);
    emitNet(`_bl_cb_${eventName}`, playerId, resourceName, key, ...args);
    return new Promise((resolve) => {
        activeEvents[key] = resolve;
    });
}

export function onClientCallback(eventName: string, cb: (playerId: number, ...args: any[]) => any) {
    onNet(`_bl_cb_${eventName}`, async (resource: string, key: string, ...args: any[]) => {
        const src = source;
        let response: any;
    
        try {
          response = await cb(src, ...args);
        } catch (e: any) {
          console.error(`an error occurred while handling callback event ${eventName}`);
          console.log(`^3${e.stack}^0`);
        }
    
        emitNet(`_bl_cb_${resource}`, src, key, response);
      });
}

const bl_bridge = exports.bl_bridge

export const core = bl_bridge.core()

export const getPlayerData = (src: number) => {
    return core.GetPlayer(src)
}

export const getFrameworkID = (src: number) => {
    const player = core.GetPlayer(src)
    if (!player) return null
    return player.id
}


const bl_config = exports.bl_appearance.config()
export const config = bl_config