import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import LckLogo from "../img/Logo.png";
import { LoginContext } from "../state/LoginState";
import api from "../api/api";
import axios from "axios"
import Cookies from "js-cookie";

const Header = () => {
  const { isLogin, setIsLogin, logincheck, userInfo } = useContext(LoginContext);
  const navigate = useNavigate();

  console.log("로그인 여부 : " + isLogin);

  const onGoogleLogin = async () => {
    try {
      const response = await axios.get("http://localhost:8080/googleLogin");
      const data = response.data;
      console.log(data)

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Google 로그인 요청 실패:", error);
    }
  };

  const googleLogout = async () => {
    const check = window.confirm("로그아웃 하시겠습니까 ?");

    if (check) {
      try {
        const response = await api.post("/googleLogout");
        if (response.data) {
          Cookies.remove("authorization");
          api.defaults.headers.common.authorization = undefined;
          alert("로그아웃 성공!");
          setIsLogin(false);
          navigate("/");
        } else {
          console.error("로그아웃 실패");
        }
      } catch (error) {
        console.error("로그아웃 실패:", error.response?.data || error.message);
      }
    }
  };

  const handleLogout = () => {
    googleLogout();
  };

  useEffect(() => {
    logincheck();
  }, []);

  return (
    <header>
      {!isLogin ? (
        <div className="headerContainer">
          <img src={LckLogo} className="LckLogoImg"></img>
          <div className="logContainer">
            <button onClick={onGoogleLogin} className="loginButton">
              Google 로그인
            </button>
          </div>
        </div>
      ) : (
        <div className="headerContainer">
          <img src={LckLogo} className="LckLogoImg" />
          <div className="logContainer">
            {" "}
            <p className="loginName">{userInfo?.username} 님</p>
            <button onClick={handleLogout} className="logoutButton">
              Google 로그아웃
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
