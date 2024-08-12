export enum Receive {
    visible = 'appearance:visible',
    data = 'appearance:data',

}

export enum Send {
    setModel = 'appearance:setModel',
    setHeadStructure = 'appearance:setHeadStructure',
    setHeadOverlay = 'appearance:setHeadOverlay',
    setHeadBlend = 'appearance:setHeadBlend',
    setProp = 'appearance:setProp',
    setDrawable = 'appearance:setDrawable',
    setTattoos = 'appearance:setTattoos',

    getModelTattoos = 'appearance:getModelTattoos',

    toggleItem = 'appearance:toggleItem',

    useOutfit = 'appearance:useOutfit',
    itemOutfit = 'appearance:itemOutfit',
    renameOutfit = 'appearance:renameOutfit',
    deleteOutfit = 'appearance:deleteOutfit',
    saveOutfit = 'appearance:saveOutfit',
    importOutfit = 'appearance:importOutfit',
    fetchOutfit = 'appearance:fetchOutfit',

    save = 'appearance:save',
    cancel = 'appearance:cancel',

    camZoom = 'appearance:camZoom',
    camMove = 'appearance:camMove',
    camSection = 'appearance:camSection',
}
