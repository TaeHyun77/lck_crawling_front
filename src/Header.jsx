import React from "react";
import "./Header.css";
import LoLLogo from "./lol.png";

import LckLogo from "./img5.png";

const Header = () => {
  return (
    <header>
      <div className="headerContainer">

        <img src={LckLogo} className="LckLogoImg"></img>
      </div>
    </header>
  );
};

export default Header;
