import { THeadOverlay, TDrawables, TProps } from './appearance';

interface Outfit {
    id?: number | string,
    label: string,
    outfit: TOutfitData
}

type TOutfitData  = {
    headOverlay: THeadOverlay
    drawables: TDrawables
    props: TProps
}

export {Outfit, TOutfitData}
