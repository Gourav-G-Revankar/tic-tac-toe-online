require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const gameManager = require("./gameManager");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.get("/", (req, res) => {
  res.send("Tic Tac Toe Backend is Running ✅");
});

io.on("connection", (socket) => {
  console.log(`Player connected: ${socket.id}`);

  socket.on("join-room", ({ code, name }) => {
    const roomCode = code.toUpperCase().trim();
    if (!roomCode || roomCode.length !== 4) return;

    gameManager.createRoom(roomCode);
    const symbol = gameManager.addPlayer(roomCode, name, socket.id);

    if (!symbol) return socket.emit("error", "Room is full");

    socket.join(roomCode);
    socket.emit("joined", { symbol });

    const room = gameManager.getRoom(roomCode);
    io.to(roomCode).emit("game-update", room);
  });

  socket.on("move", ({ code, index }) => {
    const room = gameManager.getRoom(code);
    if (!room) return;

    const player = room.players.find((p) => p.id === socket.id);
    if (!player) return;

    const success = gameManager.makeMove(code, index, player.symbol);
    if (success) {
      io.to(code).emit("game-update", gameManager.getRoom(code));
    }
  });

  socket.on("reset-game", ({ code }) => {
    gameManager.resetGame(code);
    const room = gameManager.getRoom(code);
    io.to(code).emit("game-update", room);
  });

  socket.on("leave-room", ({ code }) => {
    gameManager.removePlayer(code, socket.id);
    socket.leave(code);
    io.to(code).emit("opponent-left");
  });

  socket.on("disconnect", () => {
    console.log(`Player disconnected: ${socket.id}`);
    for (let [code, room] of gameManager.rooms.entries()) {
      if (room.players.some((p) => p.id === socket.id)) {
        gameManager.removePlayer(code, socket.id);
        io.to(code).emit("opponent-left");
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
