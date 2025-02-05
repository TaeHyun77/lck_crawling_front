import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CurrentMonth from "./pages/CurrentMonth";
import Rank from "./pages/Ranking";
import OtherMonth from "./pages/OtherMonth";
import LoginState from "./state/LoginState";

function App() {
  return (
    <BrowserRouter>
      <LoginState>
        <Routes>
          <Route path="/" element={<CurrentMonth />} />
          <Route path="/ranking" element={<Rank />} />
          <Route path="/otherMonth" element={<OtherMonth />} />
        </Routes>
      </LoginState>
    </BrowserRouter>
  );
}

export default App;
