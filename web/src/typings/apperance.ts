
export type TParamTab = string | string[]

export type TValue = {
	index: number
	value: number
	id?: string
    texture?: number
}

export type TTotalValue = {
    index: number
    total: number
    textures: number
}

export type TDrawables = {
	[key: string]: TValue
}

export type TReturnDrawables = {
    drawable: TDrawables[keyof TDrawables]
    drawTotal: TDrawTotal[keyof TDrawTotal]
}

export type TDrawTotal = {
	[key: string]: TTotalValue
}

export type TProps = {
    [key: string]: TValue
}

export type TReturnProps =  {
	prop: TProps[keyof TProps]
	propTotal: TPropTotal[keyof TPropTotal]
}

export type TPropTotal = {
	[key: string]: TTotalValue
}

export type THeadOverlay = {
	[key: string]: {
		index: number
		overlayOpacity: number
		firstColor: number
		colourType: number
		secondColor: number
		id: string
		overlayValue: number
		value?: number
	}
}

export type TEyeColor = {
    [key: string]: {
		index: number
		id: string
		value?: number
	}
}

export type THairColor = {
	highlight: number
	color: number
}

export type THeadBlend = {
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


export type THeadStructure = {
	[key: string]: TValue
}

export type THeadOverlayTotal = {
	[key: string]: number
}

export type TPropTextureTotal = {
    [key: string]: TValue
}

export type TDrawTextureTotal = {
    [key: string]: TValue
}

export type TTattooEntry = {
    label: string
    hash: number
    zone: number
    dlc?: string
}

export type TDLCTattoo = {
    label: string
    dlcIndex: number
    tattoos: TTattooEntry[]
}

export type TZoneTattoo = {
    zone: string
    zoneIndex: number
    label: string
    dlcs: TDLCTattoo[]
}

export type TTattoo = {
    zoneIndex: number
    dlcIndex: number
    tattoo: TTattooEntry
    id: number
}

export type TAppearance = {
    modelIndex: number
	model: number
	props: TProps
	drawTotal: TDrawTotal
	drawables: TDrawables
	propTotal: TPropTotal
	headOverlay: THeadOverlay | TEyeColor
	hairColor: THairColor
	headBlend: THeadBlend
	headStructure: THeadStructure
	headOverlayTotal: THeadOverlayTotal
    tattoos: TTattoo[]
}

export type TOutfitData  = {
    drawables: TDrawables
    props: TProps
}

export type TOutfit = {
    id: number;
    label: string;
    outfit: TOutfitData;
	jobname?: string|null;
}

export type TBlacklistValues = {
	[key: string]: {
		values?: number[]
		textures?: {
			[key: string | number]: number[]
		}
	}
}

export type TBlacklist = {
    models?: string[]
	drawables?: TBlacklistValues
	props?: TBlacklistValues
}

export type TJOBDATA = { 
	name: string,
	isBoss: boolean 
}

export type TModel = string

export type TMenuData = {
	locale: string;
    appearance: TAppearance;
    tabs: TParamTab;
    outfits: TOutfit[];
    blacklist: TBlacklist;
    models: TModel[];
    tattoos: TZoneTattoo[];
	job: TJOBDATA,
    allowExit: boolean;
}

export type TTab = {
    id: string;
    label: string;
    icon: string;
    src: string;
}


export type TColors = {
	label: string;
	hex: string;
}

export interface TToggles {
	hats: boolean
	masks: boolean
	glasses: boolean
	shirts: boolean
	jackets: boolean
	vest: boolean
	legs: boolean
	shoes: boolean
}

export interface Blacklist {
    models: boolean,
    drawables: boolean,
}