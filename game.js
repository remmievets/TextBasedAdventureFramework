// game.js

function startGame(playerName) {
  return `Welcome, ${playerName}, to the Realm of Shadows!`;
}

function getRoomDescription(roomId) {
  return `You are in room ${roomId}. It smells like adventure.`;
}

// Export the functions
module.exports = {
  startGame,
  getRoomDescription
};
