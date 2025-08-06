// What the server needs to know
const data = require('./public/data');
let game = {};
let view = {};
const gameTemplate = {
    //Where the player starts the game in
    currentPlayerLocation: 'strange cabin?',
    //The world, a dictonary containing all the rooms, which are dictionaries containing all their objects,
    //which themselves are dictonaries containing all their properties such as locked/unlocked.
    //this is the core of the game.
    world: {
        'strange cabin?': {
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
    impressions: { 'strange cabin?': [] },
    //The player's inventory, which starts empty.
    inventory: {},
    log:[],
};

//Function to help parse the user's input into command and target
function parseCommand(move) {
    let wordList = move.split(' ');
    //Check what the command is based on the first word in their input
    if (wordList[0] === 'look') {
        return 'look';
    } else {
        return 'invalid';
    }
}

//Function to parse the look action and return correct log entry, and update impressions
function parseLook(game, move) {
    let text = '';
    //The user looked at something! Now we need to figure out what. 
    //First we create a list of all the vaild targets for their location.
    //This includes the room they are in, impressions inside that room, and their inventory
    let validTargets = [game.currentPlayerLocation, ...game.impressions[game.currentPlayerLocation], ...Object.keys(game.inventory)];
    //Now does the player's input include any of these valid targets?
    //If it does then stop and set that as their target.
    //If no valid target is found, then the default is an invalid one.
    let target = 'invalid'
    for (const t of validTargets) {
        if (move.includes(t)) {
            target = t;
            break;
        }
    }
    //If the target is invalid then get the error message sent to the log
    //Otherwise, now that we have the target we check if the object is simple (it only has one look dialog in data.lookText) or complex.
    if (target === 'invalid') {
        text = data.lookText['invalid'];
        text = enhanceText(text, game, move);
        game.log.push(text);
    } else if (typeof data.lookText[target] === 'string') {
        //We know that the target exists and is simple. Set text to its text.
        text = data.lookText[target];
        //Before we push to the log run enhanceText to format the text and update impressions
        text = enhanceText(text, game, move);
        game.log.push(text);
    } else {
        //MIGHT NEED TO CHECK IF: target is null also write code for when complex object descriptions pop up
        //too tired do later.
    }
}

//Function to sylize the text based on the tags and update impressions.
function enhanceText(text, game, move) {
    //return the reformated text at the end
    let enhancedText = text;
    //Create an array to fill with all the new impressions
    let impressionUpdate = [];
    //Create a check, to ensure that no objects outside the current room can be added as impressions to this one.
    let validImpressions = Object.keys(game.world[game.currentPlayerLocation]);
    //First tag! Checking for clickable text designated with [c] and [/c], if we see one then iterate until we don't
    if (enhancedText.indexOf('[c]') > 0) {
        while (enhancedText.indexOf('[c]') > 0) {
            //We have this tag! We now break the text into two, before the first tag, and after.
            let beforeText = enhancedText.substring(0, enhancedText.indexOf('[c]'));
            let tempText = enhancedText.substring(enhancedText.indexOf('[c]') + 3);
            //Now we split tempText into the middle and the after based on [/c]
            let middleText = tempText.substring(0, tempText.indexOf('[/c]'));
            let afterText = tempText.substring(tempText.indexOf('[/c]') + 4);
            //Quick aside to check if the middle (Our clickable object) is a valid one, and if so then add it to impressionUpdate.
            if (validImpressions.includes(middleText)) {
                impressionUpdate.push(middleText);
            }
            //Back to the text, we update enhancedText with all three parts the tags replaced with html spans with clickable class.
            enhancedText = beforeText + "<span class='clickable'>" + middleText + "</span>" + afterText;
        }
    }
    //Second tag! Checking for [t] and if it's in the text replacing it with the player's target.
    //Do this later, I'm tired


    //Before we end, update the impressions based on impressionUpdate.
    game.impressions[game.currentPlayerLocation] = [...new Set([...game.impressions[game.currentPlayerLocation], ...impressionUpdate])]
    //Finally all the way at the end, return the newly enhanced text
    return enhancedText;
}

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
    //Add the user's text to the log whatever it is that they typed
    game[gameId].log.push(">>" + move);
    //attempt to parse the user's action and return the proper changes and text
    let command = parseCommand(move);
    if (command === 'look') {
        parseLook(game[gameId], move);
    }
    return game[gameId];
}

// Export the functions
module.exports = {
    startGame,
    updateGame,
    getGameView,
    parseAction,
};
