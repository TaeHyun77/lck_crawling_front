import React, { useEffect, useState} from "react";
import { Link, useLocation } from "react-router-dom";
import Header from "./Header";
import axios from "axios";
import "./Home.css";
import { FaArrowRightLong } from "react-icons/fa6";

const Home = () => {
  const [scheduleList, setScheduleList] = useState([]);
  const [todayScheduleList, setTodayScheduleList] = useState([]);
  const [currentDate, setCurrentDate] = useState("");

  const location = useLocation();

  // 일정 데이터 가져오기
  const getScheduleList = async () => {
    try {
      const response = await axios.get("http://localhost:8080/schedules");
      const data = response.data;

      setScheduleList(data);

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

  console.log(currentDate);

  // matchDate 기준 경기 일정 정렬
  const groupedSchedules = scheduleList.reduce((acc, schedule) => {
    const { matchDate } = schedule;
    if (!acc[matchDate]) {
      acc[matchDate] = [];
    }
    acc[matchDate].push(schedule);
    return acc;
  }, {});

  // matchDate 기준 경기 일정 정렬
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

      <div className="options">
        <Link
          to="/home"
          className={`nav-link ${
            location.pathname === "/" ? "active" : ""
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
                  <div className="match-info">
                    <div className="team-info">
                      <p>{schedule.team1}</p>
                      <img
                        src={schedule.teamImg1}
                        alt={`${schedule.team1} logo`}
                      />
                    </div>
                    <div className="score">
                      {schedule.teamScore1 ===
                      "경기가 아직 진행되지 않았습니다." ? (
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
        <h2>경기 일정</h2>
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
                  <div className="match-info">
                    <div className="team-info">
                      <p className="team1">{schedule.team1}</p>
                      <img
                        src={schedule.teamImg1}
                        alt={`${schedule.team1} logo`}
                      />
                    </div>
                    <div className="score">
                      {schedule.teamScore1 ===
                      "경기가 아직 진행되지 않았습니다." ? (
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
      </div>
    </>
  );
};

export default Home;
