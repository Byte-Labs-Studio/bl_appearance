interface HairData { 
    color: number, 
    highlight: number 
}

// interface for head overlay data

interface HeadOverlayData {
    name: string;
    index: number;
    overlayValue?: number;
    colourinterface?: number;
    value?: number;
    colourType?: number;
    firstColor?: number;
    secondColor?: number;
    overlayOpacity?: number;
};

// interface for head structure data
interface HeadStructureData {
    name: string;
    index: number;
    value: number;
};

// interface for drawable data
interface DrawableData extends HeadStructureData {
    texture: number;
};

// interface for total drawables and props
interface TotalData {
    name: string;
    index: number;
    total: number;
    textures: number;
};

type PedHandle = number;
type PedModel = number;

export {HairData, PedModel, PedHandle, TotalData, DrawableData, HeadStructureData, HeadOverlayData}