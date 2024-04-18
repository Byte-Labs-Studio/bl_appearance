import { DebugAction } from '@typings/events'
import { toggleVisible } from './visibility'
import { DebugEventSend } from '@utils/eventsHandlers'
import { Receive } from '@enums/events'
import { debugAppearance, debugBlacklist, debugModels, debugOutfits, debugTattoos } from './debugAppearance'
import type { TMenuData } from '@typings/apperance'

/**
 * The initial debug actions to run on startup
 */
const InitDebug: DebugAction[] = [
    {
        label: 'Visible',
        action: () => toggleVisible(true),
        delay: 500,
    },
    {
        label: 'Data',
        action: () => {
            DebugEventSend<TMenuData>(Receive.data, {
                tabs: ['heritage', 'hair', 'clothes', 'accessories', 'face', 'makeup', 'outfits', 'tattoos'],
                appearance: debugAppearance,
                blacklist: debugBlacklist,
                tattoos: debugTattoos,
                outfits: debugOutfits,
                models: debugModels,
                locale: JSON.stringify({}),
            })
        },
    },
]

export default InitDebug


export function InitialiseDebugSenders(): void {
    for (const debug of InitDebug) {
        setTimeout(() => {
            debug.action()
        }, debug.delay || 0)
    }
}
