import React, { useEffect, useState, createContext } from "react";
import api from "./api/api";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

export const LoginContext = createContext();

const LoginState = ({ children }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [roles, setRoles] = useState({ isUser: false, isAdmin: false });
  const [userInfo, setUserInfo] = useState({});

  const navigate = useNavigate();

  const logincheck = async () => {
    const accessToken = Cookies.get("Authorization");
    console.log(accessToken)

    if (accessToken) {

      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      try {
        const response = await api.get("http://localhost:8080/info");
        const data = response.data;

        if (data === "UNAUTHORIZED" || response.status === 401) {
          console.error("Access 토큰이 만료되거나 잘못되었습니다.");
          return;
        }

        loginSetting(data, accessToken);
      } catch (error) {
        console.error(`Error: ${error}`);
        if (error.response && error.response.status) {
          console.error(`Status: ${error.response.status}`);
        }
      }
    } else {
      console.warn("Access Token이 없습니다.");
    }
  };

  const loginSetting = (userData, accessToken) => {
    const { username, role, name, email } = userData;

    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    setIsLogin(true);

    setUserInfo({ username, role, name, email });
  };

  useEffect(() => {
    logincheck();
  }, []);

  return (
    <LoginContext.Provider
      value={{ isLogin, setIsLogin, userInfo, roles, logincheck }}
    >
      {children}
    </LoginContext.Provider>
  );
};

export default LoginState;