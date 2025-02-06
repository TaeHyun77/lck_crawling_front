import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Header from "../header/Header";
import api from "../api/api";
import "../pages/CurrentMonth.css";
import { FaArrowRightLong } from "react-icons/fa6";

const Home = () => {
  const [scheduleList, setScheduleList] = useState([]);
  const [todayScheduleList, setTodayScheduleList] = useState([]);
  const [currentDate, setCurrentDate] = useState("");

  const location = useLocation();

  // 일정 데이터 가져오기
  const getScheduleList = async () => {
    try {
      const response = await api.get("http://localhost:8080/schedules");
      const data = response.data;

      const monthSchedules = data.filter((schedule) => schedule.month === 1);

      setScheduleList(monthSchedules);

      const todaySchedules = data.filter(
        (schedule) => schedule.matchDate === currentDate
      );

      setTodayScheduleList(todaySchedules);

      console.log("Schedules:", data);
      console.log("Today Schedules:", todaySchedules);
    } catch (error) {
      console.error("LCK 일정 리스트를 불러오지 못했습니다.", error);
    }
  };

  useEffect(() => {
    if (currentDate) {
      getScheduleList();
    }
  }, [currentDate]);

  useEffect(() => {
    const today = new Date();

    const formattedDate = today.toLocaleDateString("ko-KR", {
      weekday: "short",
    });

    const month = today.getMonth() + 1;
    const day = today.getDate();

    const customFormattedDate = `0${month}월 ${day}일 (${formattedDate})`;

    setCurrentDate(customFormattedDate);
  }, []);

  // matchDate 기준 경기 일정 정렬
  const groupedSchedules = scheduleList.reduce((acc, schedule) => {
    const { matchDate } = schedule;
    if (!acc[matchDate]) {
      acc[matchDate] = [];
    }
    acc[matchDate].push(schedule);
    return acc;
  }, {});

  // today matchDate 경기 일정 정렬
  const groupedFilteredSchedules = todayScheduleList.reduce((acc, schedule) => {
    const { matchDate } = schedule;
    if (!acc[matchDate]) {
      acc[matchDate] = [];
    }
    acc[matchDate].push(schedule);
    return acc;
  }, {});

  return (
    <>
      <Header />

      <div className="HomeContainer" style={{ marginTop: "30px" }}>
        <div className="schedule-container">
          {Object.entries(groupedFilteredSchedules).map(([date, schedules]) => (
            <div key={date} className="schedule-group">
              <div className="data-container">
                <p className="schedule-date">
                  <span className="today-hide" style={{ border: "none" }}>
                    오늘의 경기
                  </span>
                </p>
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
                  <div className="match-info">
                    <div className="team-info">
                      <p>{schedule.team1}</p>
                      <img
                        src={schedule.teamImg1}
                        alt={`${schedule.team1} logo`}
                      />
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
                    <div className="team-info">
                      <img
                        src={schedule.teamImg2}
                        alt={`${schedule.team2} logo`}
                      />
                      <p>{schedule.team2}</p>
                    </div>
                  </div>
                  <div className="icon">
                    <FaArrowRightLong />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="schedule-container">
          {Object.entries(groupedSchedules).map(([date, schedules]) => (
            <div key={date} className="schedule-group">
              <div className="data-container">
                {date === currentDate ? (
                  <p className="schedule-date">
                    {date} <span className="today-hide">오늘</span>
                  </p>
                ) : (
                  <p className="schedule-date">{date}</p>
                )}
              </div>
              {schedules.map((schedule, index) => (
                <div
                  key={index}
                  className="schedule-card"
                  onClick={() => window.open(schedule.matchDetailUrl)}
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
                      <img
                        src={schedule.teamImg1}
                        alt={`${schedule.team1} logo`}
                      />
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
                      <img
                        src={schedule.teamImg2}
                        alt={`${schedule.team2} logo`}
                      />
                      <p>{schedule.team2}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Home;
