import { ped } from './../'
import { TZoneTattoo } from '@dataTypes/tattoos';

const getTattoos = (): TZoneTattoo[] => {
    const [TATTOO_LIST, TATTOO_CATEGORIES] = exports.bl_appearance.tattoos()
    const tattooZones: TZoneTattoo[] = [];

    for (let i = 0; i < TATTOO_CATEGORIES.length; i++) {
        const category = TATTOO_CATEGORIES[i];

        const index = category.index
        const zone = category.zone
        const label = category.label

        tattooZones[index] = {
            zone,
            label,
            zoneIndex: index,
            dlcs: [],
        };

        for (let j = 0; j < TATTOO_LIST.length; j++) {
            const dlcData = TATTOO_LIST[j];
            tattooZones[index].dlcs[j] = {
                label: dlcData.dlc,
                dlcIndex: j,
                tattoos: [],
            };
        }
    }

    const isFemale = GetEntityModel(ped) === GetHashKey('mp_f_freemode_01');

    for (let dlcIndex = 0; dlcIndex < TATTOO_LIST.length; dlcIndex++) {
        const data = TATTOO_LIST[dlcIndex];
        const { dlc, tattoos } = data;
        const dlcHash = GetHashKey(dlc);
        const tattooDataList = tattoos || [];

        for (let i = 0; i < tattooDataList.length; i++) {
            const tattooData = tattooDataList[i];
            let tattoo: string | null = null;

            const lowerTattoo = tattooData.toLowerCase();
            const isFemaleTattoo = lowerTattoo.includes('_f');

            if (isFemaleTattoo && isFemale) {
                tattoo = tattooData;
            } else if (!isFemaleTattoo && !isFemale) {
                tattoo = tattooData;
            }

            if (tattoo) {
                const hash = GetHashKey(tattoo);
                const zone = GetPedDecorationZoneFromHashes(dlcHash, hash);

                if (zone !== -1 && hash) {
                    const zoneTattoos = tattooZones[zone].dlcs[dlcIndex].tattoos;

                    zoneTattoos.push({
                        label: tattoo,
                        hash,
                        zone,
                        dlc,
                    });
                }
            }
        }
    }


    console.log(JSON.stringify(tattooZones))
    return tattooZones;
}

export default getTattoos