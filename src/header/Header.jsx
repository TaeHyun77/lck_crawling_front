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
import { MdOutlineNotificationsNone } from "react-icons/md";
import { MdOutlineNotificationsOff } from "react-icons/md";
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

  // 경기 일정 리스트
  const [scheduleList, setScheduleList] = useState([]);
  // 고유한 팀 리스트
  const [teamList, setTeamList] = useState([]);
  // 사용자가 선택한 선호하는 팀 리스트
  const [selectedTeams, setSelectedTeams] = useState([]);

  // 팀 선택 드랍다운 관련
  const dropdownRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fcm 토큰 값
  const [fcmToken, setFcmToken] = useState("");

  // 웹 알림 권한 값
  const [notificationPermission, setNotificationPermission] = useState(null);
  // 사용자의 알림 허용 여부
  const [isNotification, setIsNotification] = useState(false);

  const onGoogleLogin = async () => {
    try {
      const response = await axios.get("http://localhost:8080/googleLogin");
      const data = response.data;

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
          navigate("/?month=4");
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

  const getRankingList = async () => {
    try {
      const response = await api.get("http://localhost:8080/ranking");
      setScheduleList(response.data);
      console.log("ranking:", response.data);
    } catch (error) {
      console.error("LCK 순위 리스트를 불러오지 못했습니다.", error);
    }
  };

  // 팀 이름 목록
  const getUniqueTeamList = () => {
    const teamArray = [];

    // 매핑 테이블 정의
    const teamNameMap = {
      DK: "Dplus KIA",
      한화생명: "한화생명e스포츠",
      농심: "농심 레드포스",
      DNF: "DN 프릭스",
      BFX: "BNK 피어엑스",
      KT: "kt 롤스터",
      OK저축은행: "OK저축은행 브리온",
    };

    scheduleList.forEach((schedule) => {
      const originalName = schedule.teamName;
      const displayName = teamNameMap[originalName] || originalName;

      teamArray.push({ name: displayName, img: schedule.img });
    });

    setTeamList(teamArray);
  };

  // 선호하는 팀 선택
  const handleClickButton = async (selectedTeams) => {
    const check = window.confirm("선호하는 팀을 변경하시겠습니까 ?");

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
        console.log("기존 FCM 토큰 삭제 시도");

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
        console.log("새로운 FCM 토큰 발급");
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

  const UserNotification = async () => {
    const check = window.confirm(
      isNotification
        ? "알림 설정을 해제하시겠습니까?"
        : "알림 설정을 허용하시겠습니까?"
    );

    if (check) {
      const newNotificationState = !isNotification;
      setIsNotification(newNotificationState);

      // userInfo 업데이트하여 UI에 반영
      setUserInfo((prevUserInfo) => ({
        ...prevUserInfo,
        notificationPermission: newNotificationState,
      }));

      // 서버에 알림 설정 업데이트 요청
      await sendNotificationPermission(newNotificationState, userInfo?.email);
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

  useEffect(() => {
    logincheck();
    getRankingList();
  }, []);

  // 사용자가 변경된 경우 user noti 값 설정
  useEffect(() => {
    if (userInfo) {
      setIsNotification(Boolean(userInfo.notificationPermission));
    }
  }, [userInfo]);

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
          to="/?month=4"
          className={`nav-link ${
            location.search.includes("month=1") ||
            location.search.includes("month=2") ||
            location.search.includes("month=4")
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
              {(MdOutlineNotificationsNone, MdOutlineNotificationsOff)}{" "}
              <button className="notification_btn" onClick={UserNotification}>
                {!isNotification ? (
                  <>
                    <MdOutlineNotificationsNone
                      style={{ marginRight: "6px", fontSize: "18px" }}
                    />
                    알림 허용
                  </>
                ) : (
                  <>
                    <MdOutlineNotificationsOff
                      style={{ marginRight: "6px", fontSize: "18px" }}
                    />
                    알림 해제
                  </>
                )}
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
            <Link
              to="/?month=4"
              className={`month-nav-link ${
                location.search.includes("month=4") ? "active" : ""
              }`}
            >
              4월
            </Link>
            <Link
              to="/?month=5"
              className={`month-nav-link ${
                location.search.includes("month=5") ? "active" : ""
              }`}
            >
              5월
            </Link>
            <Link
              to="/?month=7"
              className={`month-nav-link ${
                location.search.includes("month=7") ? "active" : ""
              }`}
            >
              7월
            </Link>
            <Link
              to="/?month=8"
              className={`month-nav-link ${
                location.search.includes("month=8") ? "active" : ""
              }`}
            >
              8월
            </Link>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
