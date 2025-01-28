import React from "react";
import "./Header.css";
import LckLogo from "../img/Logo.png";

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
