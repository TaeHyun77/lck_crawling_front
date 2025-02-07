import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Rank from "./pages/Ranking";
import Home from "./pages/Home";
import LoginState from "./state/LoginState";

function App() {
  return (
    <BrowserRouter>
      <LoginState>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ranking" element={<Rank />} />
        </Routes>
      </LoginState>
    </BrowserRouter>
  );
}

export default App;
