import { TTattoo } from './tattoos';
import { Outfit} from './outfits';

export type TMenuTypes = 'appearance' | 'outfits' | 'tattoos' | 'clothes' | 'accessories' | 'face' | 'makeup' | 'heritage'

type TVector4 = [number, number, number, number]
export type TAppearanceZone = {
    type: TMenuTypes,
    coords: TVector4,
    jobs? : string[]
    gangs? : string[]
    groups? : string[]
}


interface THairData { 
    color: number, 
    highlight: number 
}

// interface for head overlay data

interface HeadOverlayData {
    index: number;
    overlayValue?: number;
    colourinterface?: number;
    colourType?: number;
    firstColor?: number;
    secondColor?: number;
    overlayOpacity?: number;
    hairColor?: number
    hairHighlight?: number
    eyeColor?: number
};

// interface for head structure data
interface HeadStructureData {
    name?: string;
    index: number;
    value: number;
};

// interface for drawable data
interface DrawableData extends HeadStructureData {
    texture: number;
    isTexture?: boolean
};

// interface for total drawables and props
interface TotalData {
    id: string;
    index: number;
    total: number;
    textures: number;
};

type PedHandle = number;
type PedModel = number;

interface THeadBlend  {
	skinSecond: number
	skinThird: number
	shapeSecond: number
	shapeThird: number
	shapeFirst: number
	hasParent: boolean
	skinMix: number
	shapeMix: number
	thirdMix: number
	skinFirst: number
}

export type TValue = {
	index: number
	value: number
	id?: string
    texture?: number
}

export type TProps = {
    [key: string]: TValue
}

export type TTotalValue = {
    index: number
    total: number
    textures: number
}

export type TDrawTotal = {
	[key: string]: TTotalValue
}

export type TDrawables = {
	[key: string]: TValue
}

export type TPropTotal = {
	[key: string]: TTotalValue
}

export type THeadOverlay = {
	[key: string]: HeadOverlayData
}
export type THairColor = {
	highlight: number
	color: number
}

export type THeadStructure = {
	[key: string]: TValue
}

export type THeadOverlayTotal = {
	[key: string]: number
}

export type TClothes = {
    headOverlay: THeadOverlay
    drawables: TDrawables
    props: TProps
}

export type TSkin = {
    headBlend: THeadBlend
    headStructure: THeadStructure
    hairColor: THairColor
    model: number
}

export type TAppearance = TClothes & TSkin & {
    modelIndex?: number
    drawTotal?: TDrawTotal
    propTotal?: TPropTotal
    headOverlayTotal?: THeadOverlayTotal
    tattoos?: TTattoo[]
    currentTattoos?: TTattoo[]
    outfits?: Outfit[]
}


export type TToggleData = {
    item: string;
    toggle: boolean;
    data: TDrawables[keyof TDrawables] | TProps[keyof TProps];
    hookData?: any;
}

export type SkinDB = {
    skin: string;
    clothes: string;
    tattoos: string;
    id: number;
}

export {THeadBlend, THairData, PedModel, PedHandle, TotalData, DrawableData, HeadStructureData, HeadOverlayData}