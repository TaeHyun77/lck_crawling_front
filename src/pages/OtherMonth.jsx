import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../api/api";
import Header from "../header/Header";
import "../pages/CurrentMonth.css";
import quest from "../img/quest.png";

const OtherMonth = () => {
  const location = useLocation();
  const [scheduleList, setScheduleList] = useState([]);

//   const today = new Date();
//   const month = Number(`${today.getMonth() + 1}`);

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

  // matchDate 기준 경기 일정 정렬
  const groupedSchedules = scheduleList.reduce((acc, schedule) => {
    const { matchDate } = schedule;
    if (!acc[matchDate]) {
      acc[matchDate] = [];
    }
    acc[matchDate].push(schedule);
    return acc;
  }, {});

  console.log(scheduleList);

  useEffect(() => {
    getScheduleList();
  }, []);

  return (
    <>
      <Header />

      <div className="options">
        <Link
          to="/otherMonth"
          className={`nav-link ${
            location.pathname === "/otherMonth" ? "active" : ""
          }`}
        >
          일정
        </Link>
        <Link
          to="/ranking"
          className={`nav-link ${
            location.pathname === "/rank" ? "active" : ""
          }`}
        >
          순위
        </Link>
      </div>

      <div className="HomeContainer" style={{ marginTop: "30px" }}>
        <div className="schedule-container">
          <div className="otherMonth">
            <Link
              to="/"
              className={`month-nav-link ${
                location.pathname === "/" ? "active" : ""
              }`}
            >
              1월
            </Link>
            <Link
              to="/otherMonth"
              className={`month-nav-link ${
                location.pathname === "/otherMonth" ? "active" : ""
              }`}
            >
              2월
            </Link>
          </div>
        </div>
        {Object.entries(groupedSchedules).map(([date, schedules]) => (
          <div key={date} className="schedule-group">
            <div className="data-container">
              <p className="schedule-date">{date}</p>
            </div>
            {schedules.map((schedule, index) => (
              <div
                key={index}
                className="schedule-card"
              >
                <div className="time">{schedule.startTime}</div>
                <div className="matchStatus-info">
                  {schedule.matchStatus === "종료" ? (
                    <p style={{ color: "red" }}>{schedule.matchStatus}</p>
                  ) : (
                    <p style={{ color: "blue" }}>{schedule.matchStatus}</p>
                  )}
                </div>
                <div className="stageType">
                    <p>{schedule.stageType}</p>
                  </div>
                <div className="match-info">
                  <div className="team1-info">
                    <p className="team1">{schedule.team1}</p>
                    {schedule.teamImg1 == null ? (
                      <img src={quest} />
                    ) : (
                      <img src={schedule.teamImg1} />
                    )}
                  </div>
                  <div className="score">
                    {schedule.teamScore1 === "none" ? (
                      <p> vs </p>
                    ) : (
                      <p>
                        {schedule.teamScore1} : {schedule.teamScore2}
                      </p>
                    )}
                  </div>
                  <div className="team2-info">
                    {schedule.teamImg2 == null ? (
                      <img src={quest} />
                    ) : (
                      <img src={schedule.teamImg2} />
                    )}
                    <p>{schedule.team2}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
};

export default OtherMonth;
