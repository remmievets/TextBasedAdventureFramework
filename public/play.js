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


//Old code below
/*
    'use strict';


    global view, data, roles, send_action, action_button


// TODO: show "reshuffle" flag next to card deck display

function toggle_counters() {
    // Cycle between showing everything, only markers, and nothing.
    console.log('toggle_counters');
    
    if (ui.map.classList.contains("hide_markers")) {
        ui.map.classList.remove("hide_markers")
        ui.map.classList.remove("hide_pieces")
    } else if (ui.map.classList.contains("hide_pieces")) {
        ui.map.classList.add("hide_markers")
    } else {
        ui.map.classList.add("hide_pieces")
    }
    
}

 COMMON 

function lerp(a, b, t) {
    return a + t * (b - a);
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

 DATA 

const CARDS = data.cards;

 ACCESSORS 

 ANIMATION 

let activeSpace = null;
let offsetX = 0;
let offsetY = 0;
let wasDragged = false;

const map = document.getElementById('board');
const container = document.getElementById('tokens');


const map = document.getElementById('map');
const container = document.getElementById('spaces');


function on_space_click(e) {
    if (activeSpace) return;
    if (wasDragged) {
        console.log('ignored container click');
        wasDragged = false;
        return;
    }
    console.log('container click');
    const { x, y } = getRelativeClickPosition(e);
    const space = on_create_space(x, y);
    container.appendChild(space);
    makePlay('MOVE CLICK CLOCK');
}

function getRelativeClickPosition(e) {
    const rect = container.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
    };
}

function on_create_space(x, y) {
    console.log('create space');
    const space = document.createElement('div');
    space.classList.add('space');
    space.style.left = `${x}px`;
    space.style.top = `${y}px`;
    space.style.width = '58px';
    space.style.height = '58px';

    space.addEventListener('mousedown', on_drag_start);
    return space;
}

function on_handle_move(e) {
    if (!activeSpace) return;
    console.log('handle move');
    wasDragged = true;
    const { x, y } = getRelativeClickPosition(e);
    activeSpace.style.left = `${x - offsetX}px`;
    activeSpace.style.top = `${y - offsetY}px`;
}

function on_drag_start(e) {
    console.log('drag start');
    activeSpace = e.target;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    activeSpace.style.cursor = 'grabbing';
}

function on_drag_ends(e) {
    console.log('drag end');
    if (activeSpace) {
        activeSpace.style.cursor = 'grab';
        activeSpace = null;
    }
}


map.addEventListener('click', on_space_click);
document.addEventListener('mousemove', on_handle_move);
document.addEventListener('mouseup', on_drag_ends);
console.log(map);


 BUILD UI 

let ui = {
    favicon: document.getElementById('favicon'),
    header: document.querySelector('header'),
    status: document.getElementById('status'),
    tooltip: document.getElementById('tooltip'),
    buttons: document.getElementById('actions'),
    prompt: document.getElementById('prompt'),

    hand: document.getElementById('hand'),
    mapw: document.getElementById('mapwrap'),
    map: document.getElementById('map'),

    last_played: document.getElementById('last_played'),
    tokens_element: document.getElementById('tokens'),
    spaces_element: document.getElementById('spaces'),
    markers_element: document.getElementById('markers'),
    pieces_element: document.getElementById('pieces'),

    location_marker: null,
    sauron_marker: null,

    hand_select: document.getElementById('hand_select'),

    players: {
        frodo: {
            hand: document.getElementById('cards_frodo'),
            ring: document.getElementById('ring_1_text'),
            heart: document.getElementById('heart_1_text'),
            sun: document.getElementById('sun_1_text'),
            shields: document.getElementById('shields_1_text'),
            marker: null,
        },
        sam: {
            hand: document.getElementById('cards_sam'),
            ring: document.getElementById('ring_2_text'),
            heart: document.getElementById('heart_2_text'),
            sun: document.getElementById('sun_2_text'),
            shields: document.getElementById('shields_2_text'),
            marker: null,
        },
        pipin: {
            hand: document.getElementById('cards_pipin'),
            ring: document.getElementById('ring_3_text'),
            heart: document.getElementById('heart_3_text'),
            sun: document.getElementById('sun_3_text'),
            shields: document.getElementById('shields_3_text'),
            marker: null,
        },
        merry: {
            hand: document.getElementById('cards_merry'),
            ring: document.getElementById('ring_4_text'),
            heart: document.getElementById('heart_4_text'),
            sun: document.getElementById('sun_4_text'),
            shields: document.getElementById('shields_4_text'),
            marker: null,
        },
        fatty: {
            hand: document.getElementById('cards_fatty'),
            ring: document.getElementById('ring_5_text'),
            heart: document.getElementById('heart_5_text'),
            sun: document.getElementById('sun_5_text'),
            shields: document.getElementById('shields_5_text'),
            marker: null,
        },
    },
};

function reset_all_card_states() {
    const cards = document.querySelectorAll('.card.action, .card.selected');
    cards.forEach((card) => {
        card.classList.remove('action', 'selected');
        card.removeEventListener('click', on_click_action);
    });
}

function enable_card_selection(cards) {
    cards.forEach((cardId) => {
        const cardEl = document.querySelector(`.card_${cardId}`);
        if (!cardEl) return;
        cardEl.classList.add('action');
        cardEl.addEventListener('click', on_click_action);
    });
}

function on_click_action(evt) {
    const cardEl = event.currentTarget;
    if (cardEl.classList.contains('action')) {
        cardEl.classList.remove('action');
        cardEl.classList.add('selected');
    } else if (cardEl.classList.contains('selected')) {
        cardEl.classList.remove('selected');
        cardEl.classList.add('action');
    }
}

function build_piece(cn) {
    let e = document.createElement('div');
    e.className = cn;
    return e;
}

function show_piece(p, e) {
    p.appendChild(e);
}

function show_piece_at(p, e, x, y) {
    show_piece(p, e);
    e.style.left = x + 'px';
    e.style.top = y + 'px';
}

function on_init(view) {
    // LOG START
    // Initialize the log part of the display
    let container = document.getElementById('log');
    container.replaceChildren();

    // Loop through each log entry (text) and call on_log
    for (const entry of view.log) {
        let logElement = on_log(entry);
        container.appendChild(logElement);
    }

    scroll_log_to_end();
    // LOG END

    // Update last played card
    // TBD

    // Sauron location
    if (!ui.sauron_marker) {
        ui.sauron_marker = build_piece('marker sauron');
    }
    let space = 'track_' + view.sauron;
    show_piece_at(ui.tokens_element, ui.sauron_marker, data.board[space][0] + 25, data.board[space][1] + 75);

    // Fellowship location
    if (!ui.location_marker) {
        ui.location_marker = build_piece('marker grey');
    }
    show_piece_at(ui.tokens_element, ui.location_marker, data.board[view.loc][0], data.board[view.loc][1]);

    // Loop players
    for (const player in view.players) {
        // Update player hand
        let p = player.toLowerCase();
        const cardContainer = ui.players[p].hand;
        cardContainer.replaceChildren();

        for (const card of view.players[player].hand) {
            const cardDiv = document.createElement('div');
            cardDiv.classList.add('card', `card_${card}`);
            cardContainer.appendChild(cardDiv);
        }

        // Update player stats
        ui.players[p].ring.textContent = view.players[player].rings;
        ui.players[p].heart.textContent = view.players[player].hearts;
        ui.players[p].sun.textContent = view.players[player].suns;
        ui.players[p].shields.textContent = view.players[player].shields;

        // Update player markers
        if (!ui.players[p].marker) {
            ui.players[p].marker = build_piece('marker ' + p);
        }
        let pspace = 'track_' + view.players[player].corruption;
        show_piece_at(
            ui.tokens_element,
            ui.players[p].marker,
            data.board[pspace][0] + data.board[p][0],
            data.board[pspace][1] + data.board[p][1],
        );
    }

    // Add cards to hand_select
    const selContainer = ui.hand_select;
    selContainer.replaceChildren();

    if (view.selectHand.length > 0) {
        ui.hand_select.className = 'cards player-hand';
        for (const card of view.selectHand) {
            const cardDiv = document.createElement('div');
            cardDiv.classList.add('card', `card_${card}`);
            selContainer.appendChild(cardDiv);
        }
    }
    else
    {
        ui.hand_select.className = 'hidden';
    }

    // Update tokens on map
    if (view.loc in data) {
        ui.map.className = view.loc;
        ui.mapw.className = '';
    } else {
        ui.mapw.className = 'hide_map';
    }
    // TBD

    // Update prompt
    ui.prompt.textContent = view.prompt.message;

    // Assign header a color based on player
    if (view.prompt.player) {
        ui.header.className = view.prompt.player.toLowerCase();
    } else {
        ui.header.className = '';
    }

    // Update action buttons if available
    ui.buttons.replaceChildren();
    if (view.prompt.buttons) {
        const availableActions = view.prompt.buttons;
        for (const [actionName, label] of Object.entries(availableActions)) {
            action_button(actionName, label);
        }
    }

    // Update if there are selectable cards or not
    if (view.prompt.cards) {
        enable_card_selection(view.prompt.cards);
        //send_action("DISTRIBUTE", `${view.prompt.action.cards[0]} Frodo`);
    } else {
        reset_all_card_states();
    }
}

 UPDATE UI 

function on_update(view) {
    console.log(view);
    on_init(view);
}

 TOOLTIPS 

 LOG 

function sub_minus(_match, p1) {
    return '\u2212' + p1;
}

function sub_card(_match, p1) {
    let x = p1 | 0;
    let n = data.cards[x].name;
    return `<i class="tip">${n}</i>`;
    //return `<i class="tip" onmouseenter="on_focus_card_tip(${x})" onmouseleave="on_blur_card_tip(${x})">${n}</i>`
}

const ICONS = {
    D1: '<span class="die white d1"></span>',
    D2: '<span class="die white d2"></span>',
    D3: '<span class="die white d3"></span>',
    D4: '<span class="die white d4"></span>',
    D5: '<span class="die white d5"></span>',
    D6: '<span class="die white d6"></span>',
};

function sub_icon(match) {
    return ICONS[match] || match;
}

function on_log(text) {
    let p = document.createElement('div');

    if (text.startsWith('>>')) {
        p.className = 'ii';
        text = text.substring(2);
    } else if (text.startsWith('>')) {
        p.className = 'i';
        text = text.substring(1);
    } else if (text.startsWith('=t')) {
        p.className = 'h turn';
        text = text.substring(2);
    } else if (text.startsWith('=!')) {
        p.className = 'h';
        text = text.substring(3);
    } else if (text.startsWith('=f')) {
        p.className = 'h frodo';
        text = text.substring(3);
    } else if (text.startsWith('=s')) {
        p.className = 'h sam';
        text = text.substring(3);
    } else if (text.startsWith('=p')) {
        p.className = 'h sam';
        text = text.substring(3);
    } else if (text.startsWith('=m')) {
        p.className = 'h sam';
        text = text.substring(3);
    } else if (text.startsWith('=y')) {
        p.className = 'h sam';
        text = text.substring(3);
    }

    text = text.replace(/&/g, '&amp;');
    text = text.replace(/</g, '&lt;');
    text = text.replace(/>/g, '&gt;');

    text = text.replace(/-(\d)/g, sub_minus);

    text = text.replace(/\b[D][1-6]\b/g, sub_icon);

    text = text.replace(/C(\d+)/g, sub_card);

    p.innerHTML = text;
    return p;
}
*/