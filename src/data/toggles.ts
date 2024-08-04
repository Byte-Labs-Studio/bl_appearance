

export default {
    hats: {
        type: "prop",
        index: 0,
    },
    glasses: {
        type: "prop",
        index: 1,
    },
    masks: {
        type: "drawable",
        index: 1,
        off: 0,
    },
    shirts: {
        type: "drawable",
        index: 8,
        off: 15,
        hook: {
            drawables: [
                { component: 3, variant: 15, texture: 0, id: 'torsos' },
                { component: 11, variant: 15, texture: 0, id: 'jackets'}
            ]
        }
    },
    jackets: {
        type: "drawable",
        index: 11,
        off: 15,
        hook: {
            drawables: [
                { component: 3, variant: 15, texture: 0, id: 'torsos' },
                { component: 8, variant: 15, texture: 0, id: 'shirts'}
            ]
        }
    },
    vest: {
        type: "drawable",
        index: 10,
        off: 15,
    },
    legs: {
        type: "drawable",
        index: 4,
        off: 11,
    },
    shoes: {
        type: "drawable",
        index: 6,
        off: 13,
    }
}