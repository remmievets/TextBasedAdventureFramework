// What the server needs to know
let game = {};
let view = {};
const gameTemplate = {
    //Where the player starts the game in
    currentPlayerLocation: 'Strange Cabin?',
    //The world, a dictonary containing all the rooms, which are dictionaries containing all their objects,
    //which themselves are dictonaries containing all their properties such as locked/unlocked.
    //this is the core of the game.
    world: {
        'Strange Cabin?': {
            'oak door': {
                locked: true,
                unlockObject: 'oak key',
            },
            bed: {},
            nightstand: {
                contains: ['oak key'],
            },
            'oak key': {
                holdable: true,
            },
        },
    },
    //All the impressions the player has had, which is the list of objects and rooms that the player has seen once before.
    impressions: { 'Strange Cabin?': [] },
    //The player's inventory, which starts empty.
    inventory: {},
    log:[],
};

//Copy the game template to the new game
function startGame(gameId) {
    console.log(`START GAME ${gameId}`);
    game[gameId] = structuredClone(gameTemplate);
    console.log(game[gameId]);
    return game[gameId];
}

function updateGame(gameId, gameData) {
    game[gameId] = gameData;
}

function getGameView(gameId) {
    console.log(`GAME VIEW ${gameId}`);
    return game[gameId];
}

function parseAction(gameId, move) {
    console.log(`PARSE ACTION ${gameId} ${move}`);
    return game[gameId];
}

// Export the functions
module.exports = {
    startGame,
    updateGame,
    getGameView,
    parseAction,
};
