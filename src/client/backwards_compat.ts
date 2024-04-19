import { setPedAppearance } from "./appearance/setters"

function illeniumExport(name: string, cb: Function) {
    AddEventHandler(`__cfx_export_illenium-appearance_${name}`, function(setCB) {
        setCB(cb)
    })
}

function qbClothingExport(name: string, cb: Function) {
    AddEventHandler(`__cfx_export_qb-clothing_${name}`, function(setCB) {
        setCB(cb)
    })
}

illeniumExport('setPedAppearance', async (ped: any, skinData: any) => {
    setPedAppearance(ped, skinData)
})


on('qb-clothing:client:loadPlayerClothing', (data: any, ped: any) => {
    setPedAppearance(ped, data)
})