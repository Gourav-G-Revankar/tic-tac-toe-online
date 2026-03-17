import { useState } from "react";
import StartScreen from "./components/StartScreen";
import GameScreen from "./components/GameScreen";

function App() {
  const [screen, setScreen] = useState("start");
  const [playerName, setPlayerName] = useState("");
  const [code, setCode] = useState("");

  return (
    <>
      {screen === "start" && (
        <StartScreen
          playerName={playerName}
          setPlayerName={setPlayerName}
          setCode={setCode}
          setScreen={setScreen}
        />
      )}

      {screen === "game" && (
        <GameScreen playerName={playerName} code={code} setScreen={setScreen} />
      )}
    </>
  );
}

export default App;
