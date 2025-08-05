'use strict';

//Setup document elements as variables
const enterButton = document.getElementById('enter-button');
const userInput = document.getElementById('user-input');
const roomHeader = document.getElementById('room-header');
const roomList = document.getElementById('room-list');
const inventoryList = document.getElementById('inventory-list');
const atlasList = document.getElementById('atlas-list');

//Setup empty lists for the roomList, inventoryList, and atlasList respectively
let roomListInternal = [];
let inventoryListInternal = [];
let atlasListInternal = [];

//Function for recieving input from the user
function recievedInput(event) {
    if (event.target.id == "enter-button" || event.key == "Enter") {
        console.log("I got input:" + userInput.value);
        makeMove(userInput.value);
        //After reading the input, resets the input field.
        userInput.value = '';
    }
}

//Add listeners for clicking the enter button and entering text.
if (enterButton) { 
    enterButton.addEventListener('click', recievedInput);
}

if (userInput) { 
    userInput.addEventListener('keydown', recievedInput);
}

//function for updating the visuals of the screen to reflect the new game state
function updateScreen(gameState) {
    //Update the room-header to be the name of the current room
    roomHeader.innerHTML = gameState["game"]["currentPlayerLocation"];

    //Update the room, inventory, and atlas lists with current information
    //roomList wants the impression list for the current room the player is in
    updateList(roomList, gameState["game"]["impressions"][gameState["game"]["currentPlayerLocation"]]);
    //inventory wants the inventory
    updateList(inventoryList, gameState["game"]["inventory"]);
    //atlas needs the entire dictionary of impressions
    updateList(atlasList, gameState["game"]["impressions"]);

    //Go through all the new clickable text elements and add event listeners to them.
    const clickableElements = document.querySelectorAll('.clickable');
    clickableElements.forEach(element => {
        element.addEventListener('click', function() {
            //We want to add the word clicked to the user input field
            userInput.value += this.textContent;
        });
        element.addEventListener('mouseenter', function() {
            //Then we want them to visually look different when moused over
            this.style.textDecoration = 'underline';
        });
        element.addEventListener('mouseleave', function() {
            //Then we want them to visually look different when moused over
            this.style.textDecoration = 'none';
        });
    });
}

//function for filling one of the three lists with given list items and making them clickable elements
function updateList(listHTML, listArray) {
    //listArray will be either a list or a dictionary, if it's a dictionary I want the keys as a list.
    let convertedList = listArray;
    let finalText = "";
    if (!Array.isArray(listArray)) {
        //it isn't a list, so make it one
        console.log(listHTML, listArray);
        convertedList = Object.keys(listArray);
    }
    //TEMPORARY ADDING OF TEST ITEMS
    // REMOVE LATER
    //!!!!!!!!!!!!!!!!!!!!!!!!!!!
    convertedList.push("example item", "nothing", "item with a lot of words", "extremelyLongWordTest");
    convertedList.push("blue", "red", "green", "purple", "yellow", "grey", "black", "opal");
    convertedList.push("emerald", "diamond", "opal", "lapis", "coal", "silver", "key", "gold", "platnim");
    //Sort the items in the list because why not
    convertedList.sort();
    //Now, for each item in the list generate tags so it'll be a clickable link and then concatonate to the finalText.
    for (let i = 0; i < convertedList.length; i++) {
        finalText += "<div class='list-index'><div class='list-dot'>- </div><span class='clickable'>" + convertedList[i] + "</span></div>";
    }
    //set the listHTML's innerHTML to whatever the finalText is.
    listHTML.innerHTML = finalText;
}

//server stuff
var search_params = new URLSearchParams(window.location.search);
const gameId = search_params.get('gameId');

function loadGame() {
    fetch(`/game/${gameId}`)
        .then((res) => res.json())
        .then((game) => {
            console.log('This is a fetch message');
            console.log(game);
            updateScreen(game);
            //on_init(game.board);
        });
}

function makeMove(move) {
    fetch('/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, move }),
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.error) {
                alert(data.error);
            } else {
                console.log(data);
            }
        });
}

window.onload = loadGame;
