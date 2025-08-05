'use strict';

//Setup document elements as variables
const enterButton = document.getElementById('enter-button');
const userInput = document.getElementById('user-input');

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

//server stuff
var search_params = new URLSearchParams(window.location.search);
const gameId = search_params.get('gameId');

function loadGame() {
    fetch(`/game/${gameId}`)
        .then((res) => res.json())
        .then((game) => {
            console.log('This is a fetch message');
            console.log(game);
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
                on_update(data.board);
            }
        });
}

window.onload = loadGame;
