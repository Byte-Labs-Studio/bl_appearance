//https://github.com/overextended/ox_lib/blob/master/package/server/resource/callback/index.ts

export function onClientCallback(eventName: string, cb: (playerId: number, ...args: any[]) => any) {
    onNet(`__ox_cb_${eventName}`, async (resource: string, key: string, ...args: any[]) => {
        const src = source;
        let response: any;

        try {
            response = await cb(src, ...args);
        } catch (e: any) {
            console.error(`an error occurred while handling callback event ${eventName}`);
        }

        emitNet(`__ox_cb_${resource}`, src, key, response);
    });
}
