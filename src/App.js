import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Rank from "./pages/Ranking";
import OtherMonth from "./pages/OtherMonth";
import LoginState from "./LoginState";

function App() {
  return (
    <BrowserRouter>
      <LoginState>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ranking" element={<Rank />} />
          <Route path="/otherMonth" element={<OtherMonth />} />
        </Routes>
      </LoginState>
    </BrowserRouter>
  );
}

export default App;
