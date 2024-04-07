import { appearance } from '@enums';

export enum appearance {
    setModel = 'appearance:setModel',
    setHeadStructure = 'appearance:setHeadStructure',
    setHeadOverlay = 'appearance:setHeadOverlay',
    setHeadBlend = 'appearance:setHeadBlend',
    setProp = 'appearance:setProp',
    setDrawable = 'appearance:setDrawable',
    setTattoos = 'appearance:setTattoos',
}


const actionHandlers = {
    [appearance.setModel]: (data: any, cb: any) => {
        
    },
    [appearance.setHeadStructure]: (data: any, cb: any) => {
    },
    [appearance.setHeadOverlay]: (data: any, cb: any) => {
    },
    [appearance.setHeadBlend]: (data: any, cb: any) => {
    },
    [appearance.setProp]: (data: any, cb: any) => {
    },
    [appearance.setDrawable]: (data: any, cb: any) => {
    },
    [appearance.setTattoos]: (data: any, cb: any) => {

    },
};

for (const action of Object.values(appearance)) {
    RegisterNuiCallback(action, (data: any, cb: Function) => {
        const handler = actionHandlers[action];
        if (!handler) return

        handler(data, cb);
    });
}
