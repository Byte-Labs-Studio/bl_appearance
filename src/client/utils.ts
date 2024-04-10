export const debugdata = (data: any) => {
    console.log(JSON.stringify(data, (key, value) => {
        if (typeof value === "string") {
            return value.replace(/\n/g, "\\n");
        }
        return value;
    }, 2))
}

export const sendNUIEvent = (action: string, data: any) => {
    SendNUIMessage({
        action: action,
        data: data
    });
}

export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const requestModel = async (model: string | number): Promise<number> => {
    let modelHash: number = typeof model === 'number' ? model : GetHashKey(model)

    if (!IsModelValid(modelHash)) {
        exports.bl_bridge.notify()({
            title: 'Invalid model!',
            type: 'error',
            duration: 1000
        })

        throw new Error(`attempted to load invalid model '${model}'`);
    }

    if (HasModelLoaded(modelHash)) return modelHash
    
    RequestModel(modelHash);

    const waitForModelLoaded = (): Promise<void> => {
        return new Promise(resolve => {
            const interval = setInterval(() => {
                if (HasModelLoaded(modelHash)) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });
    };

    await waitForModelLoaded();

    return modelHash;
};