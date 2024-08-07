import { THeadOverlay, TDrawables, TProps } from './appearance';

interface Outfit {
    id?: number | string,
    label: string,
    outfit: TOutfitData,
    jobname?: string,
    job?: { name: string, rank: number } | null;
}

type TOutfitData  = {
    headOverlay: THeadOverlay
    drawables: TDrawables
    props: TProps;
    job?: { name: string, rank: number } | null;
}

export {Outfit, TOutfitData}
