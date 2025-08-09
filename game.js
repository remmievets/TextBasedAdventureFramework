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
            nightstand: {},
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

//Function to help parse the user's input into a valid command or return invalid if it can't
function parseCommand(move) {
    let wordList = move.split(' ');
    //return what the command is based on the first word in their input
    return wordList[0];
}

//Function to figure out what part of the user's input is the target. (remove leading commands and flair text like 'at' or 'the')
function parseTarget(game, move) {
    //First attempt to figure out the user's target based on the atlas, the inventory, and the room list (All valid targets).
    let validTargets = [game.currentPlayerLocation, ...game.impressions[game.currentPlayerLocation], ...Object.keys(game.inventory)];
    for (const t of validTargets) {
        if (move.includes(t)) {
            return t;
        }
    }
    //Split the user input into an array based on spaces.
    let wordList = move.split(' ');
    //Trim the commands from the output (assuming we failed to figure out what their target is). Otherwise return the whole input.
    if (wordList[0] === 'look') {
        //Remove the first word because it's a command
        wordList.shift();
        //Remove 'at' because it was likely added by the look button.
        (wordList[0] === 'at') && wordList.shift()
    } else if (wordList[0] === 'take') {
        //Remove the first word because it's a command
        wordList.shift();
        //Remove 'the' because it was likely added by the take button.
        (wordList[0] === 'the') && wordList.shift()
    } else {
        return move;
    }
    //rebuild the target, and return the full string.
    let text = '';
    for (let i = 0; i < wordList.length; i++) {
      text += wordList[i];
      if (i < wordList.length - 1) {
        text += " "
      }
    }
    return text;
}

//Function to parse the look action and return correct log entry, and update impressions
function parseLook(game, target) {
    let text = '';
    //The user looked at something!
    //We have the target so, we check if the object is simple (it only has one look dialog in data.lookText) or complex.
    if (typeof data.lookText[target] === 'undefined') {
        //The target exists in the room, but has no unique text, or doesn't exist at all.
        text = data.lookText['invalid'];
        text = enhanceText(text, game, target);
        game.log.push(text);
    } else if (typeof data.lookText[target] === 'string') {
        //We know that the target exists and is simple. Set text to its text.
        text = data.lookText[target];
        //Before we push to the log run enhanceText to format the text and update impressions
        text = enhanceText(text, game, target);
        game.log.push(text);
    } else {
        //Otherwise we know that the description is complex, and dependant on the properties of the object.
        //First, let's check if the object is locked/unlocked (does it contain the 'locked' property)
        if (Object.keys(game.world[game.currentPlayerLocation][target]).includes('locked')) {
            //It does! So we can display text depending on if the locked property is true (locked)/false (unlocked)
            text = (game.world[game.currentPlayerLocation][target]['locked']) ? data.lookText[target]['locked'] : data.lookText[target]['unlocked'];
            text = enhanceText(text, game, target);
            game.log.push(text);
        }
        //Add more complex description types to the end here.
    }
}

function parseTake(game, target) {
    let text = '';
    //The user tried to take something!
    //Because it's funny, have unique dialog if they attempt to take a room or an inventory item.
    //move should already be parsed by parseTarget, this might be slightly redundant.
    let invalidTargetsRooms = Object.keys(game.world);
    let invalidTargetsInventory = Object.keys(game.inventory);
    //Find text for attempting to pick up the object
    if (invalidTargetsRooms.includes(target)) {
        //Is their target a room? Then send an error
        text = data.takeText['invalidRoom'];
        text = enhanceText(text, game, target);
        game.log.push(text);
    } else if (invalidTargetsInventory.includes(target)) {
        //Is their target an inventory item? Then send an error
        text = data.takeText['invalidInventory'];
        text = enhanceText(text, game, target);
        game.log.push(text);
    } else if (typeof data.takeText[target] === 'undefined') {
        //The target exists in the room but has no unique text, or doesn't exist
        text = data.takeText['invalid'];
        text = enhanceText(text, game, target);
        game.log.push(text);
    } else if (typeof data.takeText[target] === 'string') {
        //We know that the target exists and is simple. Set text to its text.
        text = data.takeText[target];
        text = enhanceText(text, game, target);
        game.log.push(text);
    } else {
        //Otherwise we know that the description is complex, and dependant on the properties of the object.
        //Add more complex description types to the end here.
    }
    //If the target is actually holdable, then add the object to the player's inventory, remove it from the room, and remove impression.
    //Make sure the target exists BEFORE checking its properties.
    if (Object.keys(game.world[game.currentPlayerLocation]).includes(target) && game.world[game.currentPlayerLocation][target].hasOwnProperty('holdable')) {
        //Add to inventory by copying from the room
        game.inventory[target] = game.world[game.currentPlayerLocation][target];
        //Remove it from the room
        delete game.world[game.currentPlayerLocation][target];
        //Remove the impression of the object from the room
        game.impressions[game.currentPlayerLocation].splice(game.impressions[game.currentPlayerLocation].indexOf(target), 1);
    }
}

//Function to sylize the text based on the tags and update impressions.
function enhanceText(text, game, target) {
    //return the reformated text at the end
    let enhancedText = text;
    //Create an array to fill with all the new impressions
    let impressionUpdate = [];
    //Create a check, to ensure that no objects outside the current room can be added as impressions to this one.
    let validImpressions = Object.keys(game.world[game.currentPlayerLocation]);
    //First tag! Checking for [t] and if it's in the text replacing it with the player's target.
    if (enhancedText.indexOf('[t]') > 0) {
        while (enhancedText.indexOf('[t]') > 0) {
            //We have this tag! We now break the text into two, before the tag, and after.
            let beforeText = enhancedText.substring(0, enhancedText.indexOf('[t]'));
            let afterText = enhancedText.substring(enhancedText.indexOf('[t]') + 3);
            //We update enhancedText with both halfs, the tag replaced with a string representing the player's target.
            enhancedText = beforeText + target + afterText;
        }
    }
    //Second tag! Checking for clickable text designated with [c] and [/c], if we see one then iterate until we don't
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
    //Add future tags here
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
    //attempt to parse the user's command
    let command = parseCommand(move);
    //attempt to parse the user's target
    let target = parseTarget(game[gameId], move);
    if (command === 'look') {
        //They are using the look command
        parseLook(game[gameId], target);
    } else if (command === 'take') {
        //They are using the take command
        parseTake(game[gameId], target);
    } else {
        //Not sure what the user is doing, send them an error!
        //TODO
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
