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
                { component: 8, variant: 15, texture: 0, id: 'shirts' }
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
                { component: 11, variant: 15, texture: 0, id: 'jackets' }
            ]
        }
    },
    vest: {
        type: "drawable",
        index: 9,
        off: 0,
    },
    legs: {
        type: "drawable",
        index: 4,
        off: 18,
    },
    shoes: {
        type: "drawable",
        index: 6,
        off: 34,
    }
}