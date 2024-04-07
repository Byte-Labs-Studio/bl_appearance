export enum send {
    visible = 'appearance:visible',
    data = 'appearance:data',
}

export enum appearance {
    setModel = 'appearance:setModel',
    setHeadStructure = 'appearance:setHeadStructure',
    setHeadOverlay = 'appearance:setHeadOverlay',
    setHeadBlend = 'appearance:setHeadBlend',
    setProp = 'appearance:setProp',
    setDrawable = 'appearance:setDrawable',
    setTattoos = 'appearance:setTattoos',
}

export enum receive {
    close = 'appearance:close',

    getModelTattoos = 'appearance:getModelTattoos',

    toggleItem = 'appearance:toggleItem',

    useOutfit = 'appearance:useOutfit',
    renameOutfit = 'appearance:renameOutfit',
    deleteOutfit = 'appearance:deleteOutfit',
    saveOutfit = 'appearance:saveOutfit',

    save = 'appearance:save',
    cancel = 'appearance:cancel',
}
