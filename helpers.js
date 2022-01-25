// some context-independent helper functions

// weighted random item from list of objects {weight: n, item: any}
// https://stackoverflow.com/a/55671924
export function weightedRandom(options) {
    var i
    var weights = []

    for (i = 0; i < options.length; i++)
        weights[i] = options[i].weight + (weights[i - 1] || 0)
    
    var random = Math.random() * weights[weights.length - 1]
    
    for (i = 0; i < weights.length; i++)
        if (weights[i] > random)
            break
    
    return options[i].item
}

// coins/balance database key name based on gamemode
// because blooket has a different one for every gamemode for some reason
export function coinsKeyFromMode(mode) {
    switch (mode) {
        case 'Factory': case 'Cafe': return 'ca'
        case 'Defense': return 'd'
        case 'Gold': return 'g'
        case 'Fish': return 'w'
        case 'Toy': return 't'
        case 'Racing': return 'pr'
        case 'Hack': return 'cr'
        default: return 'c'
    }
}
