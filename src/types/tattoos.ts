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