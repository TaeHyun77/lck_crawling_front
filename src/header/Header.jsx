import React, { useContext, useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Header.css";
import LckLogo from "../img/Logo.png";
import { LoginContext } from "../state/LoginState";
import api from "../api/api";
import axios from "axios";
import Cookies from "js-cookie";

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

  console.log("로그인 여부 : " + isLogin);

  const onGoogleLogin = async () => {
    try {
      const response = await axios.get("http://localhost:8080/googleLogin");
      const data = response.data;
      console.log(data);

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

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    googleLogout();
  };

  const togglePreferedGames = () => {
    setIsShowingPrefered((prev) => !prev);
  };

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
            location.search.includes("month=2") || location.search.includes("month=1") ? "active" : ""
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
          <div className="selector-container">
            <button className="team_button" onClick={togglePreferedGames}>
              {isShowingPrefered ? "전체 경기" : "선호하는 팀 경기"}
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
