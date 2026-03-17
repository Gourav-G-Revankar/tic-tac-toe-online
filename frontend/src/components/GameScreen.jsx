import React, { useState, useEffect, useRef } from "react";
import { socket } from "../socket";

const styles = {
  container: {
    textAlign: "center",
    background: "#0f172a",
    minHeight: "100vh",
    color: "#e0f2fe",
    padding: "20px 15px",
    fontFamily: "system-ui, sans-serif",
    width: "100%",
  },
  title: {
    fontSize: "2.3rem",
    fontWeight: "700",
    color: "#38bdf8",
    margin: "10px 0",
    letterSpacing: "1px",
  },
  header: {
    maxWidth: "700px",
    margin: "0 auto",
  },
  headerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerMobile: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "15px",
  },
  scoreBox: {
    background: "#1e2937",
    padding: "12px 20px",
    borderRadius: "12px",
    border: "1.5px solid #334155",
    color: "#e0f2fe",
    fontSize: "0.98rem",
    lineHeight: "1.6",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
    minWidth: "155px",
  },
  playerInfo: {
    margin: "20px 0 25px",
    fontSize: "1.1rem",
    color: "#cbd5e1",
  },
  status: {
    fontSize: "1.35rem",
    margin: "20px 0",
    fontWeight: "500",
  },
  board: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
    justifyContent: "center",
    margin: "35px auto",
    padding: "15px",
    background: "#1e2937",
    borderRadius: "16px",
    border: "1px solid #334155",
    maxWidth: "370px",
    width: "90%",
  },
  cell: {
    width: "100%",
    aspectRatio: "1 / 1",
    fontSize: "42px",
    fontWeight: "bold",
    background: "#0f172a",
    color: "#38bdf8",
    border: "3px solid #334155",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  buttonsContainer: {
    display: "flex",
    gap: "15px",
    justifyContent: "center",
    marginTop: "25px",
    flexWrap: "wrap",
  },
  reset: {
    padding: "13px 28px",
    fontSize: "1.05rem",
    background: "#38bdf8",
    color: "#0f172a",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },
  leaveBtn: {
    padding: "13px 28px",
    fontSize: "1.05rem",
    background: "transparent",
    color: "#f87171",
    border: "2px solid #f87171",
    borderRadius: "10px",
    cursor: "pointer",
  },
};

function GameScreen({ playerName, code, setScreen }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [players, setPlayers] = useState([]);
  const [mySymbol, setMySymbol] = useState("");
  const [turn, setTurn] = useState("X");
  const [winner, setWinner] = useState(null);
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [opponentLeft, setOpponentLeft] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const hasJoined = useRef(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!code || hasJoined.current) return;
    hasJoined.current = true;

    socket.emit("join-room", { code, name: playerName });

    socket.on("joined", ({ symbol }) => setMySymbol(symbol));

    socket.on("game-update", (room) => {
      setBoard(room.board || Array(9).fill(null));
      setTurn(room.turn || "X");
      setScores(room.scores || { X: 0, O: 0 });
      setPlayers(room.players || []);
      setWinner(room.winner || null);
      setOpponentLeft((room.players || []).length < 2);
    });

    socket.on("opponent-left", () => setOpponentLeft(true));

    return () => {
      socket.off("joined");
      socket.off("game-update");
      socket.off("opponent-left");
    };
  }, [code, playerName]);

  const handleClick = (index) => {
    if (board[index] || turn !== mySymbol || winner || opponentLeft) return;
    socket.emit("move", { code, index });
  };

  const handleReset = () => socket.emit("reset-game", { code });

  const handleLeave = () => {
    socket.emit("leave-room", { code });
    setScreen("start");
  };

  const myPlayer = players.find((p) => p.symbol === mySymbol);
  const opponent = players.find((p) => p.symbol !== mySymbol);
  const opponentName = opponent?.name || "Waiting...";
  const opponentSymbol = mySymbol === "X" ? "O" : "X";

  const getStatus = () => {
    if (opponentLeft) return "😢 Opponent has left the game";
    if (winner === "Draw") return "It's a Draw!";
    if (winner)
      return winner === mySymbol ? "🎉 You Won!" : `😔 ${opponentName} Won`;
    return turn === mySymbol ? "👉 Your Turn" : `Waiting for ${opponentName}`;
  };

  const statusColor = opponentLeft
    ? "#f87171"
    : winner
      ? "#a855f7"
      : turn === mySymbol
        ? "#4ade80"
        : "#facc15";

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        {isMobile ? (
          <div style={styles.headerMobile}>
            <h1 style={styles.title}>Online Tic Tac Toe</h1>
            <div style={styles.scoreBox}>
              <div>
                You ({mySymbol}): <strong>{scores[mySymbol] || 0}</strong>
              </div>
              <div>
                Opponent ({opponentSymbol}):{" "}
                <strong>{scores[opponentSymbol] || 0}</strong>
              </div>
            </div>
          </div>
        ) : (
          <div style={styles.headerContent}>
            <h1 style={styles.title}>Online Tic Tac Toe</h1>
            <div style={styles.scoreBox}>
              <div>
                You ({mySymbol}): <strong>{scores[mySymbol] || 0}</strong>
              </div>
              <div>
                Opponent ({opponentSymbol}):{" "}
                <strong>{scores[opponentSymbol] || 0}</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={styles.playerInfo}>
        <div>
          You: {myPlayer?.name || playerName} ({mySymbol})
        </div>
        <div>Opponent: {opponentName}</div>
      </div>

      <h2 style={{ ...styles.status, color: statusColor }}>{getStatus()}</h2>

      <div style={styles.board}>
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            style={{
              ...styles.cell,
              cursor: winner || opponentLeft ? "not-allowed" : "pointer",
            }}
          >
            {cell}
          </button>
        ))}
      </div>

      <div style={styles.buttonsContainer}>
        {winner && !opponentLeft && (
          <button style={styles.reset} onClick={handleReset}>
            Play Again
          </button>
        )}
        <button style={styles.leaveBtn} onClick={handleLeave}>
          Leave Game
        </button>
      </div>
    </div>
  );
}

export default GameScreen;
