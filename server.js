'use strict';

const express = require('express');
const sqlite3 = require('better-sqlite3');
const cors = require('cors');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

//This line did not work - not sure if it is needed for process.env
require('dotenv').config();

const HTTP_HOST = process.env.HTTP_HOST || 'localhost';
const HTTP_PORT = process.env.HTTP_PORT || 8080;
const SITE_NAME = process.env.SITE_NAME || 'Localhost';
const SITE_URL = process.env.SITE_URL || 'http://' + HTTP_HOST + ':' + HTTP_PORT;

// Web server setup
const app = express();

app.locals.SITE_NAME = SITE_NAME;
app.locals.SITE_NAME_P = SITE_NAME.endsWith('!') ? SITE_NAME : SITE_NAME + '.';
app.locals.SITE_URL = SITE_URL;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const db = new sqlite3('games.db');
db.prepare(
    `
    CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        board TEXT DEFAULT '---------',
        active BOOLEAN DEFAULT TRUE
    )
`,
).run();

//////////////////////
/* DATABASE FUNCTIONS */
function create_new_game(gameState) {
    const boardJson = JSON.stringify(gameState);
    const result = db.prepare(`INSERT INTO games (board) VALUES (?)`).run(boardJson);
    return result;
}

function load_game(gameId) {
    const result = db.prepare('SELECT * FROM games WHERE id = ?').get(gameId);
    if (result) {
        const gameState = JSON.parse(result.board);
        return { raw: result, board: gameState };
    }
    return null;
}

function save_game(gameId, gameState) {
    const boardJson = JSON.stringify(gameState);
    const result = db.prepare(`UPDATE games SET board = ? WHERE id = ?`).run(boardJson, gameId);
    return result;
}

// Database const
const initialPlayer = {
    hand: [],
    rings: 0,
    hearts: 0,
    suns: 0,
    shields: 0,
    corruption: 0,
};

const initialGame = {
    seed: 0,
    deck: [],
    gandalf: [],
    shields: [],
    story: [],
    players: {
        Frodo: structuredClone(initialPlayer),
        Sam: structuredClone(initialPlayer),
        Pipin: structuredClone(initialPlayer),
        Merry: structuredClone(initialPlayer),
        Fatty: structuredClone(initialPlayer),
    },
    loc: 'bagend',
    log: [],
    selectHand: [],
    state: '',
    nextState: '',
    sauron: 15,
    currentPlayer: 'Frodo',
    ringBearer: 'Frodo',
    conflict: {
        fight: 0,
        travel: 0,
        hide: 0,
        friendship: 0,
        eventValue: 0,
        ringUsed: false,
    },
    prompt: {},
};

/// @brief Information about the states of execution in the game
var states = {};

/// @brief All information about the current game
var game;

/// @brief Reduced information of game which is sent to client
var view;

function setup_game() {
    console.log('setup_game');

    // Wipe and reset game variable
    game = structuredClone(initialGame);

    // Create seed
    game.seed = crypto.randomInt(1, 2 ** 35 - 31);

    // Create deck of cards
    create_deck(game.deck, 0, 59);
    shuffle(game.deck);

    // Create deck of story tiles
    create_deck(game.story, 0, 22);
    shuffle(game.story);

    // Create deck of gandalf cards
    create_deck(game.gandalf, 0, 7);

    // Create a special shield list with 2 of each shield type for end of board bonus
    game.shields = [1, 1, 2, 2, 3, 3];
    shuffle(game.shields);

    // Advance to first state and start executing
    advance_state('bagend_gandalf');
}

//////////////////////
/* Web Links */

// Main page
app.get('/', (req, res) => {
    console.log(`slash - main page`);
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint to fetch all games for the homepage
app.get('/games', (req, res) => {
    console.log(`fetch list of games`);
    const games = db.prepare(`SELECT id, board FROM games WHERE active = TRUE`).all();
    res.json(games);
});

// Endpoint to create a new game
app.post('/new-game', (req, res) => {
    console.log(`create a new game`);

    // Setup a new game
    setup_game();

    // Save in the database
    const result = create_new_game(game);

    // Send information to webpage
    res.json({ gameId: result.lastInsertRowid, board: game });
});

// Get the state of a specific game
app.get('/game/:gameId', (req, res) => {
    console.log(`Get gameId ${req.params.gameId}`);
    const result = load_game(req.params.gameId);
    if (!result) {
        return res.status(404).json({ error: 'Game not found' });
    }
    // set game information to game
    let gameboard = result.board;

    // TEMP - Re-setup a new game
    setup_game();
    const save = save_game(req.params.gameId, game);
    // TEMP - end

    res.json({ id: req.params.gameId, board: game });
});

const moveHandlers = {
    BUTTON: (game, button, args) => execute_button(game, button, args),
};

// Make a move
app.post('/move', (req, res) => {
    try {
        const { gameId, move } = req.body;

        // Output infomation about move action
        console.log(`${move}`);

        // Split move into command and arguments
        // Splits by any whitespace
        const parts = move.trim().split(/\s+/);
        const command = parts[0];
        const func = parts[1];
        const args = parts.slice(2);

        // Dispatch to appropriate handler
        const handler = moveHandlers[command];
        if (!handler) throw new Error(`Unknown move command: ${move}`);
        handler(game, func, args);

        // Respond with the updated board and next player
        res.json({ id: gameId, board: game });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server
app.listen(HTTP_PORT, HTTP_HOST, () => {
    console.log(`Server running on ${HTTP_HOST}:${HTTP_PORT}`);
});

/* COMMON LIBRARY */
function log(s) {
    game.log.push(s);
}

function random(range) {
    // An MLCG using integer arithmetic with doubles.
    // https://www.ams.org/journals/mcom/1999-68-225/S0025-5718-99-00996-5/S0025-5718-99-00996-5.pdf
    // m = 2**35 − 31
    return (game.seed = (game.seed * 200105) % 34359738337) % range;
}

function random_bigint(range) {
    // Largest MLCG that will fit its state in a double.
    // Uses BigInt for arithmetic, so is an order of magnitude slower.
    // https://www.ams.org/journals/mcom/1999-68-225/S0025-5718-99-00996-5/S0025-5718-99-00996-5.pdf
    // m = 2**53 - 111
    return (game.seed = Number((BigInt(game.seed) * 5667072534355537n) % 9007199254740881n)) % range;
}

function shuffle(list) {
    // Fisher-Yates shuffle
    for (let i = list.length - 1; i > 0; --i) {
        let j = random(i + 1);
        let tmp = list[j];
        list[j] = list[i];
        list[i] = tmp;
    }
}

function shuffle_bigint(list) {
    // Fisher-Yates shuffle
    for (let i = list.length - 1; i > 0; --i) {
        let j = random_bigint(i + 1);
        let tmp = list[j];
        list[j] = list[i];
        list[i] = tmp;
    }
}

function create_deck(list, startIndex, endIndex) {
    list.length = 0;
    for (let i = startIndex; i <= endIndex; i++) {
        list.push(i);
    }
}

function deal_card() {
    if (game.deck.length === 0) reshuffle_deck();
    return game.deck.pop();
}

function reshuffle_deck() {}

function roll_d6() {
    return random(6) + 1;
}

// Array remove and insert (faster than splice)

function array_remove(array, index) {
    let n = array.length;
    for (let i = index + 1; i < n; ++i) array[i - 1] = array[i];
    array.length = n - 1;
}

function array_insert(array, index, item) {
    for (let i = array.length; i > index; --i) array[i] = array[i - 1];
    array[index] = item;
}

function array_insert_pair(array, index, key, value) {
    for (let i = array.length; i > index; i -= 2) {
        array[i] = array[i - 2];
        array[i + 1] = array[i - 1];
    }
    array[index] = key;
    array[index + 1] = value;
}

// Set as plain sorted array

function set_clear(set) {
    set.length = 0;
}

function set_has(set, item) {
    let a = 0;
    let b = set.length - 1;
    while (a <= b) {
        let m = (a + b) >> 1;
        let x = set[m];
        if (item < x) b = m - 1;
        else if (item > x) a = m + 1;
        else return true;
    }
    return false;
}

function set_add(set, item) {
    let a = 0;
    let b = set.length - 1;
    while (a <= b) {
        let m = (a + b) >> 1;
        let x = set[m];
        if (item < x) b = m - 1;
        else if (item > x) a = m + 1;
        else return;
    }
    array_insert(set, a, item);
}

function set_delete(set, item) {
    let a = 0;
    let b = set.length - 1;
    while (a <= b) {
        let m = (a + b) >> 1;
        let x = set[m];
        if (item < x) b = m - 1;
        else if (item > x) a = m + 1;
        else {
            array_remove(set, m);
            return;
        }
    }
}
