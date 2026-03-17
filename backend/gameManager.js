const rooms = new Map();

const createRoom = (code) => {
  if (!rooms.has(code)) {
    rooms.set(code, {
      players: [],
      board: Array(9).fill(null),
      turn: "X",
      scores: { X: 0, O: 0 },
      gameStarted: false,
      winner: null,
    });
  }
  return rooms.get(code);
};

const getRoom = (code) => rooms.get(code);

const calculateWinner = (board) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return board.every((cell) => cell !== null) ? "Draw" : null;
};

const addPlayer = (code, name, socketId) => {
  const room = getRoom(code);
  if (!room || room.players.length >= 2) return null;

  const symbol = room.players.length === 0 ? "X" : "O";

  room.players.push({ id: socketId, name, symbol });
  if (room.players.length === 2) room.gameStarted = true;

  return symbol;
};

const makeMove = (code, index, symbol) => {
  const room = getRoom(code);
  if (!room || room.board[index] || room.turn !== symbol || room.winner)
    return false;

  room.board[index] = symbol;
  const result = calculateWinner(room.board);

  if (result) {
    room.winner = result;
    if (result !== "Draw") {
      room.scores[result] = (room.scores[result] || 0) + 1;
    }
  } else {
    room.turn = symbol === "X" ? "O" : "X";
  }
  return true;
};

const resetGame = (code) => {
  const room = getRoom(code);
  if (!room) return false;

  room.board = Array(9).fill(null);
  room.turn = "X";
  room.winner = null;
  return true;
};

const removePlayer = (code, socketId) => {
  const room = getRoom(code);
  if (!room) return false;

  room.players = room.players.filter((p) => p.id !== socketId);
  if (room.players.length === 0) rooms.delete(code);
  return true;
};

module.exports = {
  createRoom,
  getRoom,
  addPlayer,
  makeMove,
  resetGame,
  removePlayer,
  calculateWinner,
  rooms,
};
