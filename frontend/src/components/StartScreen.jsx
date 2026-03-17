import React, { useState } from "react";

const styles = {
  container: { textAlign: "center", padding: "20px 15px" },
  title: {
    fontSize: "2.3rem",
    fontWeight: "700",
    color: "#38bdf8",
    margin: "20px 0",
  },
  subtitle: { color: "#94a3b8", marginBottom: "30px", fontSize: "1.05rem" },
  input: {
    padding: "14px 16px",
    fontSize: "16px",
    background: "#1e2937",
    border: "2px solid #334155",
    borderRadius: "10px",
    color: "white",
    width: "100%",
    maxWidth: "320px",
    margin: "10px auto",
    display: "block",
  },
  button: {
    padding: "14px 28px",
    fontSize: "1.05rem",
    background: "#38bdf8",
    color: "#0f172a",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    marginTop: "10px",
  },
};

function StartScreen({ playerName, setPlayerName, setCode, setScreen }) {
  const [roomCode, setRoomCode] = useState("");

  const handleJoin = () => {
    if (!playerName || !roomCode) return;
    setCode(roomCode);
    setScreen("game");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Online Tic Tac Toe</h1>
      <p style={styles.subtitle}>Join a room to play</p>

      <input
        type="text"
        placeholder="Your Name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        style={styles.input}
      />

      <input
        type="text"
        placeholder="4-Digit Room Code"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
        maxLength={4}
        style={styles.input}
      />

      <button
        style={styles.button}
        onClick={handleJoin}
        disabled={!playerName || !roomCode}
      >
        Join Game
      </button>
    </div>
  );
}

export default StartScreen;
