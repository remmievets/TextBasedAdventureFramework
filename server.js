'use strict';

const express = require('express');
const sqlite3 = require('better-sqlite3');
const cors = require('cors');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

// Game module
const tba = require('./game.js');

//This line did not work - not sure if it is needed for process.env
require('dotenv').config();

const HTTP_HOST = process.env.HTTP_HOST || '0.0.0.0';
const HTTP_PORT = process.env.HTTP_PORT || 8080;
const SITE_NAME = process.env.SITE_NAME || '0.0.0.0';
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
        game TEXT DEFAULT '---------',
        active BOOLEAN DEFAULT TRUE
    )
`,
).run();

//////////////////////
/* DATABASE FUNCTIONS */
function create_new_game(game) {
    const gameJson = JSON.stringify(game);
    const result = db.prepare(`INSERT INTO games (game) VALUES (?)`).run(gameJson);
    return result;
}

function load_game(gameId) {
    const result = db.prepare('SELECT * FROM games WHERE id = ?').get(gameId);
    if (result) {
        const gameParsed = JSON.parse(result.game);
        return { gameId: gameId, game: gameParsed };
    }
    return null;
}

function save_game(gameId, game) {
    const gameJson = JSON.stringify(game);
    const result = db.prepare(`UPDATE games SET game = ? WHERE id = ?`).run(gameJson, gameId);
    return result;
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
    const games = db.prepare(`SELECT id, game FROM games WHERE active = TRUE`).all();
    res.json(games);
});

// Endpoint to create a new game
app.post('/new-game', (req, res) => {
    console.log(`create a new game`);

    // Setup a new game
    const gameDummy = {};
    const result = create_new_game(gameDummy);

    // Now update with actual game information
    const gameData = tba.startGame(result.lastInsertRowid);

    // Save in the database
    save_game(result.lastInsertRowid, gameData);

    // Send information to webpage
    res.json({ gameId: result.lastInsertRowid, game: gameData });
});

// Get the state of a specific game
app.get('/game/:gameId', (req, res) => {
    console.log(`Get gameId ${req.params.gameId}`);

    // set game information to game
    const view = tba.getGameView(gameId);
    res.json({ id: req.params.gameId, game: view });
});

// Make a move
app.post('/move', (req, res) => {
    try {
        const { gameId, move } = req.body;

        // Output infomation about move action
        const game = tba.parseAction(gameId, move);

        // Save in the database
        save_game(result.lastInsertRowid, game);

        // Respond with the updated board and next player
        const view = tba.getGameView(gameId);
        res.json({ id: gameId, game: view });
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
