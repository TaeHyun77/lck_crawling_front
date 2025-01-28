import './App.css';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Rank from "./pages/Ranking"
import OtherMonth from "./pages/OtherMonth"

function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ranking" element={<Rank />} />
          <Route path="/otherMonth" element={<OtherMonth />} />
        </Routes>
    </BrowserRouter>
  );
}

export default App;
