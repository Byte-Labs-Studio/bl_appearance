import { DebugItem } from '@typings/events'
import { toggleVisible } from './visibility'
import { Send } from '@enums/events'
import { DebugEventSend, SendEvent } from '@utils/eventsHandlers'

/**
 * The debug actions that will show up in the debug menu.
 */
const SendDebuggers: DebugItem[] = [
    {
        label: 'Visibility',
        actions: [
            {
                label: 'True',
                action: () => toggleVisible(true),
            },
            {
                label: 'False',
                action: () => toggleVisible(false),
            },
        ],
    },
]

export default SendDebuggers
