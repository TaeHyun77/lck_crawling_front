import React, { useContext, useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Header.css";
import LckLogo from "../img/Logo.png";
import { LoginContext } from "../state/LoginState";
import api from "../api/api";
import axios from "axios";
import Cookies from "js-cookie";
import { getToken, deleteToken } from "firebase/messaging";
import { messaging } from "../FcmSetting.js";
import "../FcmSetting.js";

const Header = () => {
  const {
    isLogin,
    setIsLogin,
    logincheck,
    userInfo,
    setUserInfo,
    isShowingPrefered,
    setIsShowingPrefered,
  } = useContext(LoginContext);

  const navigate = useNavigate();
  const location = useLocation();

  const [scheduleList, setScheduleList] = useState([]);
  const [teamList, setTeamList] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);

  const dropdownRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [fcmToken, setFcmToken] = useState("");
  const [notificationPermission, setNotificationPermission] = useState(null);
  const [isNotification, setIsNotification] = useState(false);

  console.log("로그인 여부 : " + isLogin);

  const onGoogleLogin = async () => {
    try {
      const response = await axios.get("http://localhost:8080/googleLogin");
      const data = response.data;
      console.log(data);

      if (response.status == 200) {
        window.location.href = data.url;
        requestNotificationPermission();
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

  // 일정 정보
  const getScheduleList = async () => {
    try {
      const response = await api.get("http://localhost:8080/schedules");
      const data = response.data;

      const monthSchedules = data.filter((schedule) => schedule.month === 2);

      setScheduleList(monthSchedules);
    } catch (error) {
      console.error("LCK 일정 리스트를 불러오지 못했습니다.", error);
    }
  };

  // 선호하는 팀 선택 팀 종류 중복 방지를 위함
  const getUniqueTeamList = () => {
    const uniqueTeams = new Set();
    const teamArray = [];

    scheduleList.forEach((schedule) => {
      if (
        schedule.team1 &&
        !uniqueTeams.has(schedule.team1) &&
        schedule.team1 != "TBD"
      ) {
        uniqueTeams.add(schedule.team1);
        teamArray.push({ name: schedule.team1, img: schedule.teamImg1 });
      }
      if (
        schedule.team2 &&
        !uniqueTeams.has(schedule.team2) &&
        schedule.team2 != "TBD"
      ) {
        uniqueTeams.add(schedule.team2);
        teamArray.push({ name: schedule.team2, img: schedule.teamImg2 });
      }
    });

    setTeamList(teamArray);
    console.log("unique", teamArray);
  };

  const handleClickButton = async (selectedTeams) => {
    const check = window.confirm("팀을 변경하시겠습니까 ?");

    if (check) {
      try {
        const response = await api.post("http://localhost:8080/team", {
          username: userInfo?.username,
          selectedTeams: selectedTeams,
        });

        if (response) {
          alert("팀 변경 성공 !");
          toggleDropdown();
          setUserInfo((prevUserInfo) => ({
            ...prevUserInfo,
            teamNames: selectedTeams, // 변경된 팀 목록 반영
          }));
        }

        console.log("서버 응답:", response.data);
      } catch (error) {
        console.error("요청 실패:", error);
      }
    }
  };

  // 브라우저 알림 권한 선택
  const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);

    if (permission === "granted") {
      console.log("알림 권한 허용됨");

      if (userInfo?.username && isLogin) {
        console.log("Permisson : " + permission);

        getFcmToken();
      }
    } else {
      console.log("알림 권한 거부됨");
    }
  };

  // fcm 토큰 발급
  const getFcmToken = async () => {
    requestNewFcmToken();
    try {
      const currentToken = await getToken(messaging, {
        vapidKey:
          "BHHqNXnYhMEUf1_m0yL_hOSRYx9L6NBcmj_xvtWEuzSgz2HjCvloLAu_mIiBktpRBgcZLV8veurl_HU6IkdkVAI",
      });

      if (currentToken) {
        console.log("FCM 토큰:", currentToken);
        setFcmToken(currentToken);
        sendFcmTokenToServer(currentToken, userInfo?.email);
      } else {
        console.log(
          "FCM 토큰이 만료되었거나 존재하지 않습니다. 새로 발급 시도."
        );
        requestNewFcmToken();
      }
    } catch (err) {
      console.error("FCM 토큰 가져오는 중 에러 발생:", err);
      if (err.code === "messaging/token-unsubscribe") {
        console.log("토큰이 유효하지 않음, 새로 발급 시도.");
        requestNewFcmToken();
      }
    }
  };

  // fcm 토큰이 만료된 경우 재발급 로직
  const requestNewFcmToken = async () => {
    try {
      const currentToken = await getToken(messaging);

      if (currentToken) {
        console.log("기존 FCM 토큰 삭제 시도:", currentToken);

        // 기존 토큰 삭제
        await deleteToken(messaging);
        console.log("기존 FCM 토큰 삭제 완료");
      }

      // 새로운 토큰 발급
      const newToken = await getToken(messaging, {
        vapidKey:
          "BHHqNXnYhMEUf1_m0yL_hOSRYx9L6NBcmj_xvtWEuzSgz2HjCvloLAu_mIiBktpRBgcZLV8veurl_HU6IkdkVAI",
      });

      if (newToken) {
        console.log("새로운 FCM 토큰 발급:", newToken);
        setFcmToken(newToken);
        sendFcmTokenToServer(newToken, userInfo?.email);
      } else {
        console.error("새로운 FCM 토큰 발급 실패");
      }
    } catch (err) {
      console.error("새로운 FCM 토큰 요청 중 오류 발생:", err);
    }
  };

  // fcm 토큰 서버 전달
  const sendFcmTokenToServer = async (token, email) => {
    try {
      const response = await axios.post("http://localhost:8080/fcm/register", {
        fcmToken: token,
        email: email,
      });

      console.log(userInfo.email);

      if (response.status == 200) {
        console.log("FCM 토큰 서버 전송 완료");
      } else {
        console.error("FCM 토큰 서버 전송 실패");
      }
    } catch (error) {
      console.error("FCM 토큰 서버 전송 중 오류:", error);
    }
  };

  // 알림 허용 여부 전달
  const sendNotificationPermission = async (notificationPermission, email) => {
    console.log("Permisson : " + notificationPermission);

    try {
      const response = await axios.post(
        "http://localhost:8080/user/notificationPermission",
        {
          notificationPermission: notificationPermission,
          email: email,
        }
      );

      console.log("Permisson : " + notificationPermission);

      if (response.status == 200) {
        console.log("알람 허용 여부 전송 완료");
      } else {
        console.error("알람 허용 여부 전송 실패");
      }
    } catch (error) {
      console.error("알람 허용 여부 전송 오류", error);
    }
  };

  // 팀 선택 / 해제 함수
  const handleTeamSelection = (teamName) => {
    setSelectedTeams((prevSelectedTeams) =>
      prevSelectedTeams.includes(teamName)
        ? prevSelectedTeams.filter((team) => team !== teamName)
        : [...prevSelectedTeams, teamName]
    );
  };

  // 팀 선택 후 다른 영역 클릭 시 창 닫히게
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  // 팀 선택 드롭다운 버튼 전환
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // 선호하는 팀 경기 버튼 전환
  const togglePreferedGames = () => {
    setIsShowingPrefered((prev) => !prev);
  };

  const toggleNotification = () => {
    const check = window.confirm("알림 설정을 변경하시겠습니까 ?");

    if (check) {
      setIsNotification((prev) => !prev);
    }
  };

  useEffect(() => {
    if (userInfo?.email) {
      sendNotificationPermission(isNotification, userInfo.email);
    }
  }, [isNotification, userInfo?.email]);

  useEffect(() => {
    logincheck();
    getScheduleList();
  }, []);

  useEffect(() => {
    if (scheduleList.length > 0) {
      getUniqueTeamList();
    }
  }, [scheduleList]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isLogin && userInfo?.email) {
      getFcmToken();
    }
  }, [isLogin, userInfo]);

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
            <p className="loginName">
              <span
                style={{
                  marginRight: "10px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {userInfo?.teamNames?.length > 0 &&
                  userInfo.teamNames.map((teamName, index) => {
                    const team = teamList.find((t) => t.name === teamName);
                    return team ? (
                      <img
                        key={index}
                        src={team.img}
                        alt={team.name}
                        style={{
                          width: "30px",
                          height: "30px",
                          marginRight: "5px",
                        }}
                      />
                    ) : null;
                  })}
              </span>
              <span>{userInfo?.name} 님</span>
            </p>
            <button onClick={handleLogout} className="logoutButton">
              로그아웃
            </button>
          </div>
        </div>
      )}

      <div className="options">
        <Link
          to="/?month=2"
          className={`nav-link ${
            location.search.includes("month=2") ||
            location.search.includes("month=1")
              ? "active"
              : ""
          }`}
        >
          일정
        </Link>
        <Link
          to="/ranking"
          className={`nav-link ${
            location.pathname === "/ranking" ? "active" : ""
          }`}
        >
          순위
        </Link>
      </div>

      {location.pathname !== "/ranking" && (
        <>
          {isLogin ? (
            <div className="selector-container">
              <button className="team_button" onClick={togglePreferedGames}>
                {isShowingPrefered ? "전체 경기" : "선호하는 팀 경기"}
              </button>

              <button className="notification_btn" onClick={toggleNotification}>
                {!isNotification ? "알림" : "알림 해제"}
              </button>

              <div className="team-selector" ref={dropdownRef}>
                <div className="team-dropdown-box" onClick={toggleDropdown}>
                  <p className="selector-text">선호하는 팀 선택</p>
                </div>

                {isDropdownOpen && (
                  <div className="team-list-container">
                    {teamList.map((team, index) => (
                      <label key={index} className="team-item">
                        <input
                          type="checkbox"
                          checked={selectedTeams.includes(team.name)}
                          onChange={() => handleTeamSelection(team.name)}
                        />
                        <img
                          src={team.img}
                          alt={team.name}
                          className="team-logo"
                        />
                        <p>{team.name}</p>
                      </label>
                    ))}
                    <button
                      className="team-list-button"
                      onClick={() => handleClickButton(selectedTeams)}
                    >
                      선택
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div></div>
          )}

          <div className="month">
            <Link
              to="/?month=1"
              className={`month-nav-link ${
                location.search.includes("month=1") ? "active" : ""
              }`}
            >
              1월
            </Link>
            <Link
              to="/?month=2"
              className={`month-nav-link ${
                location.search.includes("month=2") ? "active" : ""
              }`}
            >
              2월
            </Link>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
