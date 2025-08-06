'use strict';

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
                updateScreen(data);
            }
        });
}

window.onload = loadGame;
