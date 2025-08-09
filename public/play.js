'use strict';

/* BUILD UI */

const ui = {
    enterButton: document.getElementById('enter-button'),
    userInput: document.getElementById('user-input'),
    roomHeader: document.getElementById('room-header'),
    roomList: document.getElementById('room-list'),
    inventoryList: document.getElementById('inventory-list'),
    atlasList: document.getElementById('atlas-list'),
    lookCommand: document.getElementById('look-command'),
    takeCommand: document.getElementById('take-command'),
};

//Function for recieving input from the user
function recievedInput(event) {
    if (event.target.id == 'enter-button' || event.key == 'Enter') {
        console.log('I got input:' + ui.userInput.value);
        makeMove(ui.userInput.value);
        //After reading the input, resets the input field.
        ui.userInput.value = '';
    }
}

//Function for adding the commands to the user input on click
function addCommand(event) {
    let text = event.target.id.substring(0, event.target.id.indexOf('-'));
    if (text === 'look') {
        text = 'look at ';
    } else if (text === 'take') {
        text = 'take the ';
    }
    ui.userInput.value = text + ui.userInput.value;
}

//Add listeners for clicking the command buttons.
if (ui.lookCommand) {
    ui.lookCommand.addEventListener('click', addCommand);
}

if (ui.takeCommand) {
    ui.takeCommand.addEventListener('click', addCommand);
}

//Add listeners for clicking the enter button and entering text.
if (ui.enterButton) {
    ui.enterButton.addEventListener('click', recievedInput);
}

if (ui.userInput) {
    ui.userInput.addEventListener('keydown', recievedInput);
}

//function for updating the visuals of the screen to reflect the new game state
function updateScreen(gameState) {
    console.log(gameState);
    console.log(ui);
    //Update the room-header to be the name of the current room
    ui.roomHeader.innerHTML = gameState['game']['currentPlayerLocation'];

    //Update the room, inventory, and atlas lists with current information
    //roomList wants the impression list for the current room the player is in
    updateList(ui.roomList, gameState['game']['impressions'][gameState['game']['currentPlayerLocation']]);
    //inventory wants the inventory
    updateList(ui.inventoryList, gameState['game']['inventory']);
    //atlas needs the entire dictionary of impressions
    updateList(ui.atlasList, gameState['game']['impressions']);

    //Update the log with it's information.
    let container = document.getElementById('log');
    container.replaceChildren();
    // Loop through each log entry (text) and call on_log
    for (const entry of gameState["game"]["log"]) {
        let logElement = on_log(entry);
        container.appendChild(logElement);
    }
    scroll_log_to_end();

    //Go through all the new clickable text elements and add event listeners to them.
    const clickableElements = document.querySelectorAll('.clickable');
    clickableElements.forEach((element) => {
        element.addEventListener('click', function () {
            //We want to add the word clicked to the user input field
            ui.userInput.value += this.textContent;
        });
        element.addEventListener('mouseenter', function () {
            //Then we want them to visually look different when moused over
            this.style.textDecoration = 'underline';
        });
        element.addEventListener('mouseleave', function () {
            //Then we want them to visually look different when moused over
            this.style.textDecoration = 'none';
        });
    });

}

//scroll to the end of the log
function scroll_log_to_end() {
    let div = document.getElementById('log');
    div.scrollTop = div.scrollHeight;
}

//function for creating a new div for the log
function on_log(text) {
    let p = document.createElement('div');
    //Give the log entry was from the player give it a different class than the server for formating and css.
    if (text.substring(0, 2) === '>>') {
        p.classList.add('log-entry-player');
    } else {
        p.classList.add('log-entry-server');
    }
    p.innerHTML = text;
    return p;
}

//function for filling one of the three lists with given list items and making them clickable elements
function updateList(listHTML, listArray) {
    //listArray will be either a list or a dictionary, if it's a dictionary I want the keys as a list.
    let convertedList = listArray;
    let finalText = '';
    if (!Array.isArray(listArray)) {
        //it isn't a list, so make it one
        console.log(listHTML, listArray);
        convertedList = Object.keys(listArray);
    }
    //Sort the items in the list because why not
    convertedList.sort();
    //Now, for each item in the list generate tags so it'll be a clickable link and then concatonate to the finalText.
    for (let i = 0; i < convertedList.length; i++) {
        finalText +=
            "<div class='list-index'><div class='list-dot'>- </div><span class='clickable'>" + convertedList[i] + '</span></div>';
    }
    //set the listHTML's innerHTML to whatever the finalText is.
    listHTML.innerHTML = finalText;
}
