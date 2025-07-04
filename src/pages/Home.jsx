import React, { useEffect, useState, useRef, useContext } from "react";
import { useLocation } from "react-router-dom";
import { LoginContext } from "../state/LoginState";
import api from "../api/api";
import Header from "../header/Header";
import "../pages/Home.css";
import quest from "../img/quest.png";

const Home = () => {
  const { userInfo, isShowingPrefered } = useContext(LoginContext);
  const [scheduleList, setScheduleList] = useState([]);
  const [preperScheduleList, setPreperScheduleList] = useState([]);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const selectedMonth = parseInt(searchParams.get("month"))

  const getScheduleList = async () => {
    try {
      const response = await api.get("http://localhost:8080/schedules");
      const data = response.data;

      const monthSchedules = data.filter(
        (schedule) => schedule.month === selectedMonth
      );

      setScheduleList(monthSchedules);
    } catch (error) {
      console.error("LCK 일정 리스트를 불러오지 못했습니다.", error);
    }
  };

  const displaySchedules = isShowingPrefered
    ? preperScheduleList
    : scheduleList;

  // matchDate 기준 경기 일정 정렬
  const groupedSchedules = displaySchedules.reduce((acc, schedule) => {
    const { matchDate } = schedule;
    if (!acc[matchDate]) {
      acc[matchDate] = [];
    }
    acc[matchDate].push(schedule);
    return acc;
  }, {});

  useEffect(() => {
    getScheduleList();
  }, [selectedMonth]);

  useEffect(() => {
    if (scheduleList.length > 0 && userInfo?.teamNames?.length > 0) {
      const preperd = scheduleList.filter(
        (schedule) =>
          userInfo.teamNames.includes(schedule.team1) ||
          userInfo.teamNames.includes(schedule.team2)
      );
      setPreperScheduleList(preperd);
    }
  }, [scheduleList, userInfo?.teamNames]);

  return (
    <>
      <Header />

      <div className="HomeContainer" style={{ marginTop: "30px" }}>
        {Object.entries(groupedSchedules).map(([date, schedules]) => (
          <div key={date} className="schedule-group">
            <div className="data-container">
              <p className="schedule-date">{date}</p>
            </div>
            {schedules.map((schedule, index) => (
              <div key={index} className="schedule-card">
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

export default Home;
