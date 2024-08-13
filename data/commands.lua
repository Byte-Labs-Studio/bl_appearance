lib.addCommand('appearance', {
    help = 'Open the appearance menu',
    params = {
        {
            name = 'target',
            type = 'playerId',
            help = 'Target player\'s server id',
        },
        {
            name = 'type',
            type = 'string',
            help = 'appearance | outfits | tattoos | clothes | accessories | face | makeup | heritage',
            optional = true
        }
    },
    restricted = 'group.admin'
}, function(source, args, raw)
    local target = args.target or source
    local type = args.type or 'appearance'
    TriggerClientEvent('bl_appearance:client:open', target, type)
end)